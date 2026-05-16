import { sql, poolPromise } from "../config/db.config.js";

class Lesson {
    constructor(lesson) {
        this.course_id = lesson.course_id;
        this.section_order = lesson.section_order;
        this.lesson_order = lesson.lesson_order;
        this.title = lesson.title;
        this.description = lesson.description;
        this.video_url = lesson.video_url;
        this.duration = lesson.duration || 0;
    }

    static async create(newLesson) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("course_id", sql.Int, newLesson.course_id)
                .input("section_order", sql.Int, newLesson.section_order)
                .input("lesson_order", sql.Int, newLesson.lesson_order)
                .input("title", sql.NVarChar, newLesson.title)
                .input("description", sql.NVarChar, newLesson.description)
                .input("video_url", sql.VarChar, newLesson.video_url)
                .input("duration", sql.Int, newLesson.duration).query(`
                    INSERT INTO lessons (course_id, section_order, lesson_order, title, description, video_url, duration)
                    VALUES (@course_id, @section_order, @lesson_order, @title, @description, @video_url, @duration);
                `);
            return newLesson;
        } catch (err) {
            console.error("Error creating lesson: ", err);
            throw err;
        }
    }

    static async findBySection(course_id, section_order) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .query(
                    "SELECT * FROM lessons WHERE course_id = @course_id AND section_order = @section_order ORDER BY lesson_order ASC",
                );
            return result.recordset;
        } catch (err) {
            console.error("Error finding lessons by section: ", err);
            throw err;
        }
    }

    static async findByCourseId(course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .query(
                    "SELECT * FROM lessons WHERE course_id = @course_id ORDER BY section_order ASC, lesson_order ASC",
                );
            return result.recordset;
        } catch (err) {
            console.error("Error finding lessons by course ID: ", err);
            throw err;
        }
    }

    static async findOne(course_id, section_order, lesson_order) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .input("lesson_order", sql.Int, lesson_order)
                .query(
                    "SELECT * FROM lessons WHERE course_id = @course_id AND section_order = @section_order AND lesson_order = @lesson_order",
                );
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding lesson: ", err);
            throw err;
        }
    }

    static async findByVideoUrl(video_url) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("video_url", sql.VarChar, video_url)
                .query("SELECT * FROM lessons WHERE video_url = @video_url");
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding lesson by video URL: ", err);
            throw err;
        }
    }

    static async update(course_id, section_order, lesson_order, updatedLesson) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            request.input("course_id", sql.Int, course_id);
            request.input("old_section_order", sql.Int, section_order);
            request.input("old_lesson_order", sql.Int, lesson_order);

            const new_section_order = updatedLesson.section_order !== undefined ? updatedLesson.section_order : section_order;
            const new_lesson_order = updatedLesson.lesson_order !== undefined ? updatedLesson.lesson_order : lesson_order;
            const isOrderChanging = new_section_order !== section_order || new_lesson_order !== lesson_order;

            let sqlBatch = "";
            if (isOrderChanging) {
                request.input("new_section_order", sql.Int, new_section_order);
                request.input("new_lesson_order", sql.Int, new_lesson_order);

                sqlBatch += `
                    SELECT * INTO #temp_user_lessons 
                    FROM user_lessons 
                    WHERE course_id = @course_id AND section_order = @old_section_order AND lesson_order = @old_lesson_order;

                    DELETE FROM user_lessons 
                    WHERE course_id = @course_id AND section_order = @old_section_order AND lesson_order = @old_lesson_order;
                `;
            }

            let updateQuery = "UPDATE lessons SET ";
            const updates = [];
            
            if (updatedLesson.title !== undefined) {
                request.input("title", sql.NVarChar, updatedLesson.title);
                updates.push("title = @title");
            }
            if (updatedLesson.description !== undefined) {
                request.input("description", sql.NVarChar, updatedLesson.description);
                updates.push("description = @description");
            }
            if (updatedLesson.video_url !== undefined) {
                request.input("video_url", sql.VarChar, updatedLesson.video_url);
                updates.push("video_url = @video_url");
            }
            if (updatedLesson.duration !== undefined) {
                request.input("duration", sql.Int, updatedLesson.duration);
                updates.push("duration = @duration");
            }

            if (isOrderChanging) {
                updates.push("section_order = @new_section_order");
                updates.push("lesson_order = @new_lesson_order");
            }

            if (updates.length === 0 && !isOrderChanging) {
                await transaction.rollback();
                return null;
            }

            updateQuery += updates.join(", ");
            updateQuery += " WHERE course_id = @course_id AND section_order = @old_section_order AND lesson_order = @old_lesson_order; ";
            sqlBatch += updateQuery;

            if (isOrderChanging) {
                sqlBatch += `
                    INSERT INTO user_lessons (user_id, course_id, section_order, lesson_order)
                    SELECT user_id, course_id, @new_section_order, @new_lesson_order 
                    FROM #temp_user_lessons;

                    DROP TABLE #temp_user_lessons;
                `;
            }

            const result = await request.query(sqlBatch);
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error updating lesson: ", err);
            throw err;
        }
    }

    static async delete(course_id, section_order, lesson_order) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .input("lesson_order", sql.Int, lesson_order)
                .query(`
                    DELETE FROM user_lessons WHERE course_id = @course_id AND section_order = @section_order AND lesson_order = @lesson_order;
                    DELETE FROM lessons WHERE course_id = @course_id AND section_order = @section_order AND lesson_order = @lesson_order;
                `);
            return result.rowsAffected[result.rowsAffected.length - 1] > 0;
        } catch (err) {
            console.error("Error deleting lesson: ", err);
            throw err;
        }
    }

    static async completeLesson(
        user_id,
        course_id,
        section_order,
        lesson_order,
    ) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .input("lesson_order", sql.Int, lesson_order).query(`
                    IF NOT EXISTS (
                        SELECT 1 FROM user_lessons 
                        WHERE user_id = @user_id AND course_id = @course_id 
                        AND section_order = @section_order AND lesson_order = @lesson_order
                    )
                    BEGIN
                        INSERT INTO user_lessons (user_id, course_id, section_order, lesson_order)
                        VALUES (@user_id, @course_id, @section_order, @lesson_order);
                    END
                `);
            return true;
        } catch (err) {
            console.error("Error completing lesson: ", err);
            throw err;
        }
    }

    static async getCompletedLessons(user_id, course_id = null) {
        try {
            const pool = await poolPromise;
            const request = pool.request().input("user_id", sql.Int, user_id);
            let query = "SELECT * FROM user_lessons WHERE user_id = @user_id";

            if (course_id) {
                request.input("course_id", sql.Int, course_id);
                query += " AND course_id = @course_id";
            }

            query += " ORDER BY section_order ASC, lesson_order ASC";

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error("Error getting completed lessons: ", err);
            throw err;
        }
    }
}

export default Lesson;
