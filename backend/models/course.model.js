import { sql, poolPromise } from "../config/db.config.js";

class Course {
    constructor(course) {
        this.course_id = course.course_id;
        this.category_id = course.category_id;
        this.instructor_id = course.instructor_id;
        this.title = course.title;
        this.description = course.description;
        this.price = course.price;
        this.original_price = course.original_price;
        this.level = course.level;
        this.thumbnail_url = course.thumbnail_url;
        this.is_available = course.is_available;
        this.created_at = course.created_at;
        this.updated_at = course.updated_at;
    }

    static async create(courseData) {
        try {
            const {
                category_id,
                instructor_id,
                title,
                description,
                original_price,
                price,
                level,
                thumbnail_url,
                is_available,
            } = courseData;
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("category_id", sql.Int, category_id)
                .input("instructor_id", sql.Int, instructor_id)
                .input("title", sql.NVarChar, title)
                .input("description", sql.NVarChar, description)
                .input("original_price", sql.Decimal(10, 2), original_price)
                .input(
                    "price",
                    sql.Decimal(10, 2),
                    price === undefined ? original_price : price,
                )
                .input("level", sql.NVarChar, level)
                .input("thumbnail_url", sql.NVarChar, thumbnail_url)
                .input(
                    "is_available",
                    sql.Bit,
                    is_available === "false" ? 0 : 1,
                ).query(`
                    INSERT INTO courses (category_id, instructor_id, title, description, original_price, price, level, thumbnail_url, is_available)
                    OUTPUT INSERTED.*
                    VALUES (@category_id, @instructor_id, @title, @description, @original_price, @price, @level, @thumbnail_url, @is_available)
                `);
            return result.recordset[0];
        } catch (err) {
            console.error("Error creating course: ", err);
            throw err;
        }
    }

    static async findById(course_id, userId = null, isAdmin = false) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("userId", sql.Int, userId)
                .input("isAdmin", sql.Bit, isAdmin ? 1 : 0).query(`
                    SELECT c.*, 
                    u.first_name + ' ' + u.last_name as instructor_name, 
                    u.avatar_url as instructor_avatar,
                    cat.name as category_name,
                    r.rating,
                    r.reviews_count as review_count,
                    ISNULL(l.duration, 0) AS duration,
                    ISNULL(e_count.students_count, 0) AS students_count
                    FROM courses c
                    JOIN users u ON c.instructor_id = u.user_id
                    LEFT JOIN categories cat ON c.category_id = cat.category_id
                    LEFT JOIN (
                        SELECT course_id, AVG(CAST(rating AS FLOAT)) AS rating, COUNT(*) as reviews_count 
                        FROM reviews 
                        GROUP BY course_id
                    ) r ON c.course_id = r.course_id
                    LEFT JOIN (
                        SELECT course_id, SUM(duration) AS duration 
                        FROM lessons 
                        GROUP BY course_id
                    ) l ON c.course_id = l.course_id
                    LEFT JOIN (
                        SELECT course_id, COUNT(*) AS students_count 
                        FROM enrollments 
                        GROUP BY course_id
                    ) e_count ON c.course_id = e_count.course_id
                    WHERE c.course_id = @course_id
                    AND (c.is_available = 1 OR @isAdmin = 1 OR c.instructor_id = @userId)
                `);
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding course by ID: ", err);
            throw err;
        }
    }

    static async findByInstructorId(
        instructor_id,
        userId = null,
        isAdmin = false,
        page = 1,
        limit = 100,
        filters = {},
    ) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();

            request.input("instructor_id", sql.Int, instructor_id);
            request.input("userId", sql.Int, userId);
            request.input("isAdmin", sql.Bit, isAdmin ? 1 : 0);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            let filterQuery =
                "WHERE c.instructor_id = @instructor_id AND (c.is_available = 1 OR @isAdmin = 1 OR c.instructor_id = @userId)";

            if (filters.search) {
                request.input("search", sql.NVarChar, `%${filters.search}%`);
                filterQuery +=
                    " AND (c.title LIKE @search OR c.description LIKE @search)";
            }

            if (filters.category_id) {
                request.input("category_id", sql.Int, filters.category_id);
                filterQuery += " AND c.category_id = @category_id";
            }

            if (
                filters.is_available !== undefined &&
                filters.is_available !== null
            ) {
                request.input(
                    "is_available_filter",
                    sql.Bit,
                    filters.is_available,
                );
                filterQuery += " AND c.is_available = @is_available_filter";
            }

            const query = `
                    SELECT c.*, 
                    r.rating,
                    r.reviews_count as review_count,
                    ISNULL(l.duration, 0) AS duration,
                    ISNULL(e_count.students_count, 0) AS students_count,
                    cat.name as category_name,
                    u.first_name + ' ' + u.last_name as instructor_name,
                    u.avatar_url as instructor_avatar
                    FROM courses c
                    JOIN users u ON c.instructor_id = u.user_id
                    LEFT JOIN categories cat ON c.category_id = cat.category_id
                    LEFT JOIN (
                        SELECT course_id, AVG(CAST(rating AS FLOAT)) AS rating, COUNT(*) as reviews_count 
                        FROM reviews 
                        GROUP BY course_id
                    ) r ON c.course_id = r.course_id
                    LEFT JOIN (
                        SELECT course_id, SUM(duration) AS duration 
                        FROM lessons 
                        GROUP BY course_id
                    ) l ON c.course_id = l.course_id
                    LEFT JOIN (
                        SELECT course_id, COUNT(*) AS students_count 
                        FROM enrollments 
                        GROUP BY course_id
                    ) e_count ON c.course_id = e_count.course_id
                    ${filterQuery}
                    ORDER BY c.created_at DESC
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                    SELECT COUNT(*) as total FROM courses c 
                    ${filterQuery};
                `;

            const result = await request.query(query);

            return {
                courses: result.recordsets[0],
                total: result.recordsets[1][0].total,
            };
        } catch (err) {
            console.error("Error finding courses by instructor ID: ", err);
            throw err;
        }
    }

    static async find(
        page,
        limit,
        userId = null,
        isAdmin = false,
        filters = {},
        sortBy = "created_at",
        order = "ASC",
    ) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();

            request.input("userId", sql.Int, userId);
            request.input("isAdmin", sql.Bit, isAdmin ? 1 : 0);
            request.input("limit", sql.Int, limit);
            request.input("offset", sql.Int, offset);

            let filterQuery =
                "WHERE (c.is_available = 1 OR @isAdmin = 1 OR c.instructor_id = @userId)";

            if (filters.search) {
                request.input("search", sql.NVarChar, `%${filters.search}%`);
                filterQuery +=
                    " AND (c.title LIKE @search OR c.description LIKE @search)";
            }

            if (filters.category_id) {
                request.input("category_id", sql.Int, filters.category_id);
                filterQuery += " AND c.category_id = @category_id";
            }

            if (filters.level) {
                request.input("level", sql.NVarChar, filters.level);
                filterQuery += " AND c.level = @level";
            }

            if (
                filters.is_available !== undefined &&
                filters.is_available !== null
            ) {
                request.input(
                    "is_available_filter",
                    sql.Bit,
                    filters.is_available,
                );
                filterQuery += " AND c.is_available = @is_available_filter";
            }

            const validOrder = ["ASC", "DESC"].includes(order.toUpperCase())
                ? order.toUpperCase()
                : "ASC";

            const sortColumn =
                sortBy === "price"
                    ? "ISNULL(c.price, c.original_price)"
                    : sortBy;

            const query = `
                SELECT c.*, 
                u.first_name + ' ' + u.last_name as instructor_name, 
                u.avatar_url as instructor_avatar,
                cat.name as category_name,
                r.rating,
                r.reviews_count as review_count,
                ISNULL(l.duration, 0) AS duration,
                ISNULL(e_count.students_count, 0) AS students_count
                FROM courses c
                JOIN users u ON c.instructor_id = u.user_id
                LEFT JOIN categories cat ON c.category_id = cat.category_id
                LEFT JOIN (
                    SELECT course_id, AVG(CAST(rating AS FLOAT)) AS rating, COUNT(*) as reviews_count 
                    FROM reviews 
                    GROUP BY course_id
                ) r ON c.course_id = r.course_id
                LEFT JOIN (
                    SELECT course_id, SUM(duration) AS duration 
                    FROM lessons 
                    GROUP BY course_id
                ) l ON c.course_id = l.course_id
                LEFT JOIN (
                    SELECT course_id, COUNT(*) AS students_count 
                    FROM enrollments 
                    GROUP BY course_id
                ) e_count ON c.course_id = e_count.course_id
                ${filterQuery}
                ORDER BY ${sortColumn} ${validOrder}
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) as total FROM courses c ${filterQuery};
            `;

            const result = await request.query(query);

            return {
                courses: result.recordsets[0],
                total: result.recordsets[1][0].total,
            };
        } catch (err) {
            console.error("Error finding courses: ", err);
            throw err;
        }
    }

    static async update(course_id, updateData) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input("course_id", sql.Int, course_id);

            let updateQuery = "UPDATE courses SET ";
            const columns = Object.keys(updateData);

            columns.forEach((col, index) => {
                let value = updateData[col];
                if (col === "is_available") {
                    value = value === "true" || value === true ? 1 : 0;
                }
                request.input(col, value);
                updateQuery += `${col} = @${col}${index < columns.length - 1 ? ", " : ""}`;
            });

            updateQuery += " OUTPUT INSERTED.* WHERE course_id = @course_id";

            const result = await request.query(updateQuery);
            return result.recordset[0];
        } catch (err) {
            console.error("Error updating course: ", err);
            throw err;
        }
    }

    static async delete(course_id) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            await request.input("course_id", sql.Int, course_id).query(`
                    DELETE FROM reviews WHERE course_id = @course_id;
                    DELETE FROM user_lessons WHERE course_id = @course_id;
                    DELETE FROM certificates WHERE course_id = @course_id;
                    DELETE FROM enrollments WHERE course_id = @course_id;
                    DELETE FROM lessons WHERE course_id = @course_id;
                    DELETE FROM sections WHERE course_id = @course_id;
                    DELETE FROM courses WHERE course_id = @course_id;
                `);

            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error deleting course: ", err);
            throw err;
        }
    }

    static async getCourseStats(course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id).query(`
                    SELECT 
                        (SELECT COUNT(*) FROM enrollments WHERE course_id = @course_id) as total_students,
                        (SELECT COUNT(*) FROM lessons WHERE course_id = @course_id) as total_lessons,
                        (SELECT SUM(duration) FROM lessons WHERE course_id = @course_id) as total_duration,
                        (SELECT AVG(CAST(rating AS FLOAT)) FROM reviews WHERE course_id = @course_id) as avg_rating
                    FROM courses c
                    LEFT JOIN (
                        SELECT course_id, AVG(CAST(rating AS FLOAT)) AS rating 
                        FROM reviews 
                        GROUP BY course_id
                    ) r ON 1=1
                `);
            return result.recordset[0];
        } catch (err) {
            console.error("Error getting course stats: ", err);
            throw err;
        }
    }
}

export default Course;
