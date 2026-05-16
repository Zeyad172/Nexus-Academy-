import { sql, poolPromise } from "../config/db.config.js";

class Review {
    static async create(user_id, course_id, rating, comment) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .input("rating", sql.Int, rating)
                .input("comment", sql.NVarChar, comment).query(`
                    INSERT INTO reviews (user_id, course_id, rating, comment)
                    VALUES (@user_id, @course_id, @rating, @comment)
                `);
            return true;
        } catch (err) {
            console.error("Error creating review: ", err);
            throw err;
        }
    }

    static async find(user_id, course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .query(
                    "SELECT * FROM reviews WHERE user_id = @user_id AND course_id = @course_id",
                );
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding review: ", err);
            throw err;
        }
    }

    static async findByCourseId(course_id, page = 1, limit = 10, sortBy = "rating", order = "DESC") {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;

            const allowedSortColumns = ["rating", "reviewed_at"];
            if (!allowedSortColumns.includes(sortBy)) sortBy = "rating";
            const validOrder = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("limit", sql.Int, limit)
                .input("offset", sql.Int, offset).query(`
                    SELECT r.*, u.first_name, u.last_name, u.avatar_url 
                    FROM reviews r
                    JOIN users u ON r.user_id = u.user_id
                    WHERE r.course_id = @course_id
                    ORDER BY r.${sortBy} ${validOrder}
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                    SELECT COUNT(*) as total FROM reviews WHERE course_id = @course_id;
                `);
            return {
                reviews: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error finding reviews: ", err);
            throw err;
        }
    }

    static async findGlobal(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();

            let filterQuery = "WHERE 1=1";
            if (filters.course_id) {
                filterQuery += " AND r.course_id = @course_id";
                request.input("course_id", sql.Int, filters.course_id);
            }
            if (filters.rating) {
                filterQuery += " AND r.rating = @rating";
                request.input("rating", sql.Int, filters.rating);
            }
            if (filters.search) {
                filterQuery += " AND (u.first_name LIKE @search OR u.last_name LIKE @search OR r.comment LIKE @search OR c.title LIKE @search)";
                request.input("search", sql.NVarChar, `%${filters.search}%`);
            }

            const query = `
                SELECT r.*, u.first_name, u.last_name, u.avatar_url, c.title as course_title
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                JOIN courses c ON r.course_id = c.course_id
                ${filterQuery}
                ORDER BY r.reviewed_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) as total 
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                JOIN courses c ON r.course_id = c.course_id
                ${filterQuery};
            `;

            const result = await request
                .input("limit", sql.Int, limit)
                .input("offset", sql.Int, offset)
                .query(query);

            return {
                reviews: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error finding global reviews: ", err);
            throw err;
        }
    }

    static async findBestReviews(limit) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("limit", sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) r.*, u.first_name, u.last_name, u.avatar_url, c.title as course_title
                    FROM reviews r
                    JOIN users u ON r.user_id = u.user_id
                    JOIN courses c ON r.course_id = c.course_id
                    WHERE r.rating >= 4
                    ORDER BY r.reviewed_at DESC;
                `);
            return result.recordset;
        } catch (err) {
            console.error("Error finding best reviews: ", err);
            throw err;
        }
    }
            


    static async update(user_id, course_id, rating, comment) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .input("rating", sql.Int, rating)
                .input("comment", sql.NVarChar, comment)
                .query(
                    "UPDATE reviews SET rating = @rating, comment = @comment WHERE user_id = @user_id AND course_id = @course_id",
                );
            return true;
        } catch (err) {
            console.error("Error updating review: ", err);
            throw err;
        }
    }

    static async delete(user_id, course_id) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .query(
                    "DELETE FROM reviews WHERE user_id = @user_id AND course_id = @course_id",
                );
            return true;
        } catch (err) {
            console.error("Error deleting review: ", err);
            throw err;
        }
    }

    static async findByInstructorId(instructor_id, page = 1, limit = 10, course_id = null, rating = null, search = null) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            
            let query = `
                SELECT r.*, u.first_name, u.last_name, u.avatar_url, c.title as course_title
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                JOIN courses c ON r.course_id = c.course_id
                WHERE c.instructor_id = @instructor_id
            `;

            let countQuery = `
                SELECT COUNT(*) as total
                FROM reviews r
                JOIN courses c ON r.course_id = c.course_id
                WHERE c.instructor_id = @instructor_id
            `;

            const request = pool.request();
            request.input("instructor_id", sql.Int, instructor_id);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            let filter = "";
            if (course_id) {
                filter += " AND r.course_id = @course_id";
                request.input("course_id", sql.Int, course_id);
            }

            if (rating) {
                filter += " AND r.rating = @rating";
                request.input("rating", sql.Int, rating);
            }

            if (search) {
                filter += " AND (u.first_name LIKE @search OR u.last_name LIKE @search OR r.comment LIKE @search)";
                request.input("search", sql.NVarChar, `%${search}%`);
            }

            const result = await request.query(`
                ${query} ${filter}
                ORDER BY r.reviewed_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                ${countQuery} ${filter};
            `);

            return {
                reviews: result.recordsets[0],
                total: result.recordsets[1][0].total
            };
        } catch (err) {
            console.error("Error finding reviews by instructor ID: ", err);
            throw err;
        }
    }
}

export default Review;
