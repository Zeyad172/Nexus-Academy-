import { sql, poolPromise } from "../config/db.config.js";

class Section {
    constructor(section) {
        this.course_id = section.course_id;
        this.section_order = section.section_order;
        this.title = section.title;
    }

    static async create(newSection) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("course_id", sql.Int, newSection.course_id)
                .input("section_order", sql.Int, newSection.section_order)
                .input("title", sql.NVarChar, newSection.title)
                .query(`
                    INSERT INTO sections (course_id, section_order, title)
                    VALUES (@course_id, @section_order, @title);
                `);
            return newSection;
        } catch (err) {
            console.error("Error creating section: ", err);
            throw err;
        }
    }

    static async findByCourseId(course_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .query("SELECT * FROM sections WHERE course_id = @course_id ORDER BY section_order ASC");
            return result.recordset;
        } catch (err) {
            console.error("Error finding sections by course ID: ", err);
            throw err;
        }
    }

    static async findOne(course_id, section_order) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .query("SELECT * FROM sections WHERE course_id = @course_id AND section_order = @section_order");
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding section: ", err);
            throw err;
        }
    }

    static async update(course_id, section_order, updatedSection) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            request.input("course_id", sql.Int, course_id);
            request.input("old_section_order", sql.Int, section_order);
            request.input("title", sql.NVarChar, updatedSection.title || null);

            const checkResult = await request.query("SELECT 1 FROM sections WHERE course_id = @course_id AND section_order = @old_section_order");
            if (checkResult.recordset.length === 0) {
                await transaction.rollback();
                return null;
            }

            const isOrderChanging = updatedSection.section_order !== undefined && Number(updatedSection.section_order) !== Number(section_order);

            if (isOrderChanging) {
                request.input("new_section_order", sql.Int, updatedSection.section_order);
                
                await request.query(`
                    SELECT * INTO #temp_user_lessons 
                    FROM user_lessons 
                    WHERE course_id = @course_id AND section_order = @old_section_order;

                    DELETE FROM user_lessons 
                    WHERE course_id = @course_id AND section_order = @old_section_order;

                    -- 1. Create the new section first to satisfy FK for lessons
                    INSERT INTO sections (course_id, section_order, title)
                    SELECT course_id, @new_section_order, ISNULL(@title, title)
                    FROM sections
                    WHERE course_id = @course_id AND section_order = @old_section_order;

                    -- 2. Update lessons to the new section
                    UPDATE lessons 
                    SET section_order = @new_section_order 
                    WHERE course_id = @course_id AND section_order = @old_section_order;

                    -- 3. Delete the old section
                    DELETE FROM sections 
                    WHERE course_id = @course_id AND section_order = @old_section_order;

                    -- 4. Restore user_lessons
                    INSERT INTO user_lessons (user_id, course_id, section_order, lesson_order)
                    SELECT user_id, course_id, @new_section_order, lesson_order 
                    FROM #temp_user_lessons;

                    DROP TABLE #temp_user_lessons;
                `);
            } else {
                if (updatedSection.title) {
                    await request.query(`
                        UPDATE sections 
                        SET title = @title 
                        WHERE course_id = @course_id AND section_order = @old_section_order;
                    `);
                } else {
                    await transaction.rollback();
                    return true;
                }
            }

            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error updating section: ", err);
            throw err;
        }
    }

    static async delete(course_id, section_order) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            
            await request
                .input("course_id", sql.Int, course_id)
                .input("section_order", sql.Int, section_order)
                .query(`
                    DELETE FROM user_lessons WHERE course_id = @course_id AND section_order = @section_order;
                    DELETE FROM lessons WHERE course_id = @course_id AND section_order = @section_order;
                    DELETE FROM sections WHERE course_id = @course_id AND section_order = @section_order;
                `);
            
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error deleting section: ", err);
            throw err;
        }
    }
}

export default Section;
