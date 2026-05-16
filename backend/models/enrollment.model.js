import { sql, poolPromise } from "../config/db.config.js";

class Enrollment {
    static async create(user_id, course_id, payment_method, transaction_id = null) {
        try {
            const pool = await poolPromise;
            
            if (transaction_id) {
                const checkTx = await pool.request()
                    .input("transaction_id", sql.NVarChar, transaction_id)
                    .query("SELECT 1 FROM enrollments WHERE transaction_id = @transaction_id");
                
                if (checkTx.recordset.length > 0) return { message: "Already processed" };
            }

            const result = await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .input("payment_method", sql.NVarChar, payment_method)
                .input("transaction_id", sql.NVarChar, transaction_id)
                .query(`
                    INSERT INTO enrollments (course_id, user_id, payment_method, payment_status, enrollment_cost, transaction_id)
                    SELECT 
                        @course_id, 
                        @user_id, 
                        ISNULL(@payment_method, 'card'),
                        'paid',
                        ISNULL(price, original_price),
                        @transaction_id
                    FROM courses
                    WHERE course_id = @course_id;
                `);

            if (result.rowsAffected[0] > 0) {
                return { user_id, course_id, message: "Enrolled successfully" };
            }
            return null;
        } catch (err) {
            console.error("Error creating enrollment: ", err);
            throw err;
        }
    }

    static async isEnrolled(user_id, course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id).query(`
                    SELECT 1 FROM enrollments 
                    WHERE user_id = @user_id AND course_id = @course_id
                `);
            return result.recordset.length > 0;
        } catch (err) {
            console.error("Error checking enrollment: ", err);
            throw err;
        }
    }

    static async getProgress(user_id, course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id).query(`
                    SELECT 
                        CASE 
                            WHEN l.total = 0 THEN 0 
                            ELSE (CAST(ISNULL(ul.completed, 0) AS FLOAT) / l.total * 100) 
                        END AS progress
                    FROM (
                        SELECT COUNT(*) as total 
                        FROM lessons 
                        WHERE course_id = @course_id
                    ) l
                    CROSS JOIN (
                        SELECT COUNT(*) as completed 
                        FROM user_lessons 
                        WHERE user_id = @user_id AND course_id = @course_id
                    ) ul
                `);
            return result.recordset[0].progress || 0;
        } catch (err) {
            console.error("Error getting progress: ", err);
            throw err;
        }
    }

    static async getInstructorEnrollments(instructor_id, course_id = null, page = 1, limit = 10, sortBy = "enrolled_at", order = "DESC") {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;

            const allowedSortColumns = ["enrolled_at", "user_id", "enrollment_cost"];
            if (!allowedSortColumns.includes(sortBy)) sortBy = "enrolled_at";
            const validOrder = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

            const request = pool.request();
            request.input("instructor_id", sql.Int, instructor_id);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            let filterQuery = "WHERE c.instructor_id = @instructor_id";
            if (course_id) {
                request.input("course_id", sql.Int, course_id);
                filterQuery += " AND e.course_id = @course_id";
            }

            const result = await request.query(`
                SELECT e.*, u.first_name, u.last_name, u.avatar_url, u.email, c.title as course_title
                FROM enrollments e
                JOIN users u ON e.user_id = u.user_id
                JOIN courses c ON e.course_id = c.course_id
                ${filterQuery}
                ORDER BY e.${sortBy} ${validOrder}
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) as total
                FROM enrollments e
                JOIN courses c ON e.course_id = c.course_id
                ${filterQuery};
            `);
            return {
                enrollments: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error fetching instructor enrollments: ", err);
            throw err;
        }
    }

    static async findByUserId(user_id, page = 1, limit = 10, sortBy = "enrolled_at", order = "DESC", filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();

            request.input("user_id", sql.Int, user_id);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            const allowedSortColumns = ["enrolled_at", "course_id", "enrollment_cost"];
            if (!allowedSortColumns.includes(sortBy)) sortBy = "enrolled_at";
            const validOrder = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

            let filterQuery = "WHERE e.user_id = @user_id";
            if (filters.search) {
                request.input("search", sql.NVarChar, `%${filters.search}%`);
                filterQuery += " AND (c.title LIKE @search OR c.description LIKE @search)";
            }

            let statusFilter = "";
            if (filters.status) {
                if (filters.status === "Completed") {
                    statusFilter = "AND progress >= 100";
                } else if (filters.status === "In Progress") {
                    statusFilter = "AND progress > 0 AND progress < 100";
                } else if (filters.status === "Not Started") {
                    statusFilter = "AND progress = 0";
                }
            }

            const query = `
                WITH ProgressCTE AS (
                    SELECT 
                        e.course_id,
                        e.user_id,
                        e.enrolled_at,
                        e.payment_method,
                        e.payment_status,
                        e.enrollment_cost,
                        c.title, 
                        c.thumbnail_url, 
                        c.instructor_id,
                        cat.name AS category_name,
                        u.first_name AS instructor_first_name, 
                        u.last_name AS instructor_last_name,
                        CASE 
                            WHEN l_count.total = 0 THEN 0 
                            ELSE (CAST(ISNULL(ul_count.completed, 0) AS FLOAT) / l_count.total * 100) 
                        END AS progress
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.course_id
                    JOIN users u ON c.instructor_id = u.user_id
                    LEFT JOIN categories cat ON c.category_id = cat.category_id
                    LEFT JOIN (
                        SELECT course_id, COUNT(*) as total 
                        FROM lessons 
                        GROUP BY course_id
                    ) l_count ON e.course_id = l_count.course_id
                    LEFT JOIN (
                        SELECT course_id, user_id, COUNT(*) as completed 
                        FROM user_lessons 
                        GROUP BY course_id, user_id
                    ) ul_count ON e.course_id = ul_count.course_id AND e.user_id = ul_count.user_id
                    ${filterQuery}
                )
                SELECT * FROM (
                    SELECT * FROM ProgressCTE
                ) as t
                WHERE 1=1 ${statusFilter}
                ORDER BY ${sortBy} ${validOrder}
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                WITH ProgressCTE AS (
                    SELECT 
                        e.course_id,
                        e.user_id,
                        CASE 
                            WHEN l_count.total = 0 THEN 0 
                            ELSE (CAST(ISNULL(ul_count.completed, 0) AS FLOAT) / l_count.total * 100) 
                        END AS progress
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.course_id
                    LEFT JOIN (
                        SELECT course_id, COUNT(*) as total 
                        FROM lessons 
                        GROUP BY course_id
                    ) l_count ON e.course_id = l_count.course_id
                    LEFT JOIN (
                        SELECT course_id, user_id, COUNT(*) as completed 
                        FROM user_lessons 
                        GROUP BY course_id, user_id
                    ) ul_count ON e.course_id = ul_count.course_id AND e.user_id = ul_count.user_id
                    ${filterQuery}
                )
                SELECT COUNT(*) as total FROM ProgressCTE
                WHERE 1=1 ${statusFilter};
            `;

            const result = await request.query(query);
            return {
                enrollments: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error fetching user enrollments: ", err);
            throw err;
        }
    }

    static async delete(user_id, course_id) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            
            await request
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .query(`
                    DELETE FROM user_lessons WHERE user_id = @user_id AND course_id = @course_id;
                    DELETE FROM enrollments WHERE user_id = @user_id AND course_id = @course_id;
                `);
            
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error deleting enrollment: ", err);
            throw err;
        }
    }

    static async findGlobal(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();
            const { search, course_id, payment_status } = filters;
            
            let filterQuery = "WHERE 1=1";
            if (search) {
                request.input("search", sql.NVarChar, `%${search}%`);
                filterQuery += " AND (u.first_name LIKE @search OR u.last_name LIKE @search OR c.title LIKE @search OR u.email LIKE @search)";
            }

            if (course_id) {
                request.input("course_id", sql.Int, course_id);
                filterQuery += " AND e.course_id = @course_id";
            }

            if (payment_status) {
                request.input("payment_status", sql.NVarChar, payment_status);
                filterQuery += " AND e.payment_status = @payment_status";
            }

            const query = `
                SELECT e.*, u.first_name, u.last_name, u.avatar_url, u.email, c.title as course_title, c.thumbnail_url
                FROM enrollments e
                JOIN users u ON e.user_id = u.user_id
                JOIN courses c ON e.course_id = c.course_id
                ${filterQuery}
                ORDER BY e.enrolled_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) as total 
                FROM enrollments e
                JOIN users u ON e.user_id = u.user_id
                JOIN courses c ON e.course_id = c.course_id
                ${filterQuery};
            `;

            const result = await request
                .input("limit", sql.Int, limit)
                .input("offset", sql.Int, offset)
                .query(query);

            return {
                enrollments: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error finding global enrollments: ", err);
            throw err;
        }
    }

    static async getUniqueStudentsByInstructorId(instructor_id, page = 1, limit = 10, search = null, course_id = null) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;

            const request = pool.request();
            request.input("instructor_id", sql.Int, instructor_id);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            let filterQuery = "";
            if (search) {
                filterQuery += " AND (u.first_name LIKE @search OR u.last_name LIKE @search OR u.email LIKE @search)";
                request.input("search", sql.NVarChar, `%${search}%`);
            }

            if (course_id) {
                filterQuery += " AND e.course_id = @course_id";
                request.input("course_id", sql.Int, course_id);
            }

            const result = await request.query(`
                SELECT 
                    u.user_id, 
                    u.first_name, 
                    u.last_name, 
                    u.email, 
                    u.avatar_url,
                    u.created_at as joined_at,
                    COUNT(e.course_id) as courses_enrolled,
                    AVG(
                        CASE 
                            WHEN l_count.total = 0 THEN 0 
                            ELSE (CAST(ISNULL(ul_count.completed, 0) AS FLOAT) / l_count.total * 100) 
                        END
                    ) as avg_progress,
                    (
                        SELECT 
                            c2.course_id,
                            c2.title,
                            e2.enrolled_at,
                            CASE 
                                WHEN l_count2.total = 0 THEN 0 
                                ELSE (CAST(ISNULL(ul_count2.completed, 0) AS FLOAT) / l_count2.total * 100) 
                            END as progress
                        FROM enrollments e2
                        JOIN courses c2 ON e2.course_id = c2.course_id
                        LEFT JOIN (
                            SELECT course_id, COUNT(*) as total 
                            FROM lessons 
                            GROUP BY course_id
                        ) l_count2 ON e2.course_id = l_count2.course_id
                        LEFT JOIN (
                            SELECT course_id, user_id, COUNT(*) as completed 
                            FROM user_lessons 
                            GROUP BY course_id, user_id
                        ) ul_count2 ON e2.course_id = ul_count2.course_id AND e2.user_id = ul_count2.user_id
                        WHERE e2.user_id = u.user_id AND c2.instructor_id = @instructor_id
                        FOR JSON PATH
                    ) as courses
                FROM users u
                JOIN enrollments e ON u.user_id = e.user_id
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN (
                    SELECT course_id, COUNT(*) as total 
                    FROM lessons 
                    GROUP BY course_id
                ) l_count ON e.course_id = l_count.course_id
                LEFT JOIN (
                    SELECT course_id, user_id, COUNT(*) as completed 
                    FROM user_lessons 
                    GROUP BY course_id, user_id
                ) ul_count ON e.course_id = ul_count.course_id AND e.user_id = ul_count.user_id
                WHERE c.instructor_id = @instructor_id ${filterQuery}
                GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.avatar_url, u.created_at
                ORDER BY joined_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(DISTINCT u.user_id) as total
                FROM users u
                JOIN enrollments e ON u.user_id = e.user_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE c.instructor_id = @instructor_id ${filterQuery};
            `);
            return {
                students: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error fetching instructor students: ", err);
            throw err;
        }
    }
}

export default Enrollment;
