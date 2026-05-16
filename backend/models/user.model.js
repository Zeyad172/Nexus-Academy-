import { sql, poolPromise } from "../config/db.config.js";

class User {
    constructor(user) {
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.hashed_password = user.hashed_password;
        this.avatar_url = user.avatar_url;
        this.role = user.role;
        this.title = user.title;
        this.bio = user.bio;
        this.is_verified = user.is_verified ?? false;
        this.otp = user.otp ?? null;
        this.otp_expires = user.otp_expires ?? null;
        this.google_id = user.google_id ?? null;
    }

    static async create(newUser) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("first_name", sql.NVarChar, newUser.first_name)
                .input("last_name", sql.NVarChar, newUser.last_name)
                .input("email", sql.NVarChar, newUser.email)
                .input(
                    "hashed_password",
                    sql.VarChar,
                    newUser.hashed_password || null,
                )
                .input("avatar_url", sql.VarChar, newUser.avatar_url)
                .input("title", sql.NVarChar, newUser.title)
                .input("bio", sql.NVarChar, newUser.bio)
                .input("otp", sql.VarChar, newUser.otp)
                .input("otp_expires", sql.BigInt, newUser.otp_expires)
                .input("google_id", sql.VarChar, newUser.google_id)
                .input("is_verified", sql.Bit, newUser.is_verified ? 1 : 0)
                .query(`
                    INSERT INTO users (
                        first_name, last_name, email, hashed_password,
                        avatar_url, title, bio, otp, otp_expires, google_id, is_verified
                    )
                    VALUES (
                        @first_name, @last_name, @email, @hashed_password,
                        @avatar_url, @title, @bio, @otp, @otp_expires, @google_id, @is_verified
                    );

                    SELECT user_id, role, is_verified FROM users WHERE user_id = SCOPE_IDENTITY();
                `);
            return {
                ...newUser,
                user_id: result.recordset[0].user_id,
                role: result.recordset[0].role,
                is_verified: result.recordset[0].is_verified,
            };
        } catch (err) {
            console.error("Error creating user: ", err);
            throw err;
        }
    }

    static async findById(user_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, user_id)
                .query("SELECT * FROM users WHERE user_id = @user_id");
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding user by ID: ", err);
            throw err;
        }
    }

    static async findBestInstructors(limit) {
        try {
            const pool = await poolPromise;
            const result = await pool.request().input("limit", sql.Int, limit)
                .query(`
            SELECT TOP (@limit) 
                u.user_id, 
                u.first_name, 
                u.last_name, 
                u.avatar_url, 
                u.title, 
                u.bio,
                AVG(CAST(r.rating AS FLOAT)) AS average_rating, 
                COUNT(DISTINCT c.course_id) AS course_count, 
                COUNT(r.course_id) AS review_count
            FROM users u
            JOIN courses c ON u.user_id = c.instructor_id
            LEFT JOIN reviews r ON c.course_id = r.course_id -- Changed to LEFT JOIN here
            WHERE u.role = 'instructor'
            GROUP BY u.user_id, u.first_name, u.last_name, u.avatar_url, u.title, u.bio
            ORDER BY average_rating DESC, review_count DESC;
        `);
            return result.recordset;
        } catch (err) {
            console.error("Error finding best instructors: ", err);
            throw err;
        }
    }

    static async findByEmail(email) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("email", sql.NVarChar, email)
                .query("SELECT * FROM users WHERE email = @email");
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding user by email: ", err);
            throw err;
        }
    }

    static async findByGoogleId(google_id) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("google_id", sql.NVarChar, google_id)
                .query("SELECT * FROM users WHERE google_id = @google_id");
            return result.recordset[0];
        } catch (err) {
            console.error("Error finding user by Google ID: ", err);
            throw err;
        }
    }

    static async find(
        page,
        limit,
        sortBy = "created_at",
        order = "ASC",
        filters = {},
    ) {
        try {
            const offset = (page - 1) * limit;
            const pool = await poolPromise;
            const request = pool.request();
            const { search, role } = filters;

            const allowedSortColumns = [
                "first_name",
                "last_name",
                "email",
                "role",
                "created_at",
            ];
            if (!allowedSortColumns.includes(sortBy)) {
                sortBy = "created_at";
            }

            const validOrder = ["ASC", "DESC"].includes(order.toUpperCase())
                ? order.toUpperCase()
                : "ASC";

            let filterQuery = "WHERE 1=1";
            if (search) {
                request.input("search", sql.NVarChar, `%${search}%`);
                filterQuery +=
                    " AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)";
            }

            if (role) {
                request.input("role", sql.NVarChar, role);
                filterQuery += " AND role = @role";
            }

            const query = `
                SELECT user_id, first_name, last_name, email, role, avatar_url, title, bio, is_verified, created_at 
                FROM users 
                ${filterQuery}
                ORDER BY ${sortBy} ${validOrder} 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) as total FROM users ${filterQuery};
            `;

            const result = await request
                .input("limit", sql.Int, limit)
                .input("offset", sql.Int, offset)
                .query(query);

            return {
                users: result.recordsets[0],
                total: result.recordsets[1][0].total,
            };
        } catch (err) {
            console.error("Error finding users: ", err);
            throw err;
        }
    }

    static async update(user_id, updatedUser) {
        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input("user_id", sql.Int, user_id);

            const allowedUpdates = [
                "first_name",
                "last_name",
                "avatar_url",
                "role",
                "title",
                "bio",
                "is_verified",
                "hashed_password",
                "otp",
                "otp_expires",
                "google_id",
            ];

            let query = "UPDATE users SET ";
            const updates = [];
            for (const [key, value] of Object.entries(updatedUser)) {
                if (value !== undefined && allowedUpdates.includes(key)) {
                    if (key === "is_verified") {
                        request.input(key, sql.Bit, value ? 1 : 0);
                    } else {
                        request.input(key, value);
                    }
                    updates.push(`${key} = @${key}`);
                }
            }

            if (updates.length === 0)
                return { message: "No data provided to update" };

            query += updates.join(", ");
            query += " WHERE user_id = @user_id";

            const result = await request.query(query);

            return result.rowsAffected[0] > 0
                ? { message: "User updated successfully" }
                : null;
        } catch (err) {
            console.error("Error updating user: ", err);
            throw err;
        }
    }

    static async delete(user_id) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            
            await request
                .input("user_id", sql.Int, user_id)
                .query(`
                    DELETE FROM reviews WHERE user_id = @user_id;
                    
                    DELETE FROM reviews WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM user_lessons WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM lessons WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM sections WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM certificates WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM enrollments WHERE course_id IN (SELECT course_id FROM courses WHERE instructor_id = @user_id);
                    DELETE FROM courses WHERE instructor_id = @user_id;

                    DELETE FROM certificates WHERE user_id = @user_id;
                    DELETE FROM user_lessons WHERE user_id = @user_id;
                    DELETE FROM enrollments WHERE user_id = @user_id;
                    DELETE FROM users WHERE user_id = @user_id;
                `);
            
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.error("Error deleting user: ", err);
            throw err;
        }
    }

    static async updateOTP(email, hashedOtp, otpExpires) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("email", sql.NVarChar, email)
                .input("otp", sql.NVarChar, hashedOtp)
                .input("otp_expires", sql.BigInt, otpExpires).query(`
                    UPDATE users 
                    SET otp = @otp, otp_expires = @otp_expires 
                    WHERE email = @email
                `);
        } catch (err) {
            console.error("Error updating OTP: ", err);
            throw err;
        }
    }

    static async verify(email) {
        try {
            const pool = await poolPromise;
            await pool.request().input("email", sql.NVarChar, email).query(`
                    UPDATE users 
                    SET is_verified = 1, otp = NULL, otp_expires = NULL 
                    WHERE email = @email
                `);
        } catch (err) {
            console.error("Error verifying user: ", err);
            throw err;
        }
    }

    static async deleteUnverified(email) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("email", sql.NVarChar, email).query(`
                    DELETE FROM users 
                    WHERE email = @email AND is_verified = 0
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error("Error deleting unverified user: ", err);
            throw err;
        }
    }
}

export default User;
