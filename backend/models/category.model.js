import { sql, poolPromise } from "../config/db.config.js";

class Category {
    constructor(category) {
        this.category_id = category.category_id;
        this.name = category.name;
    }

    static async create(newCategory) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("name", sql.NVarChar, newCategory.name).query(`
                    INSERT INTO categories (name)
                    VALUES (@name);

                    SELECT category_id FROM categories WHERE category_id = SCOPE_IDENTITY();
                `);
            return {
                ...newCategory,
                category_id: result.recordset[0].category_id,
            };
        } catch (err) {
            console.error("Error creating category: ", err);
            throw err;
        }
    }

    static async findById(category_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("category_id", sql.Int, category_id)
                .query(`
                    SELECT *, 
                    (SELECT COUNT(*) FROM courses WHERE category_id = categories.category_id) AS course_count
                    FROM categories 
                    WHERE category_id = @category_id
                `);
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding category by ID: ", err);
            throw err;
        }
    }

    static async findAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.query(`
                SELECT *, 
                (SELECT COUNT(*) FROM courses WHERE category_id = categories.category_id) AS course_count
                FROM categories
                ORDER BY course_count DESC
            `);
            return result.recordset;
        } catch (err) {
            console.error("Error finding categories: ", err);
            throw err;
        }
    }

    static async update(category_id, updatedCategory) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("category_id", sql.Int, category_id)
                .input("name", sql.NVarChar, updatedCategory.name)
                .query("UPDATE categories SET name = @name WHERE category_id = @category_id");

            return result.rowsAffected[0] > 0
                ? { message: "Category updated successfully" }
                : null;
        } catch (err) {
            console.error("Error updating category: ", err);
            throw err;
        }
    }

    static async delete(category_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("category_id", sql.Int, category_id)
                .query("DELETE FROM categories WHERE category_id = @category_id");
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error("Error deleting category: ", err);
            throw err;
        }
    }
}

export default Category;
