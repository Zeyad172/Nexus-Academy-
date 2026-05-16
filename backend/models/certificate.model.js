import { sql, poolPromise } from "../config/db.config.js";

class Certificate {
    static async issue(userId, courseId) {
        try {
            const pool = await poolPromise;
            await pool
                .request()
                .input("user_id", sql.Int, userId)
                .input("course_id", sql.Int, courseId).query(`
                    INSERT INTO certificates (user_id, course_id)
                    VALUES (@user_id, @course_id);
                `);
            return {
                userId,
                courseId,
                message: "Certificate issued successfully",
            };
        } catch (err) {
            console.error("Error issuing certificate: ", err);
            throw err;
        }
    }

    static async getByStudentAndCourse(userId, courseId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, userId)
                .input("course_id", sql.Int, courseId).query(`
                    SELECT c.*, u.first_name, u.last_name, u.email, co.title as course_name, inst.first_name as inst_first, inst.last_name as inst_last
                    FROM certificates c
                    JOIN users u ON c.user_id = u.user_id
                    JOIN courses co ON c.course_id = co.course_id
                    JOIN users inst ON co.instructor_id = inst.user_id
                    WHERE c.user_id = @user_id AND c.course_id = @course_id
                `);
            return result.recordset[0];
        } catch (err) {
            console.error("Error fetching certificate: ", err);
            throw err;
        }
    }

    static async getByStudent(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("user_id", sql.Int, userId).query(`
                    SELECT c.*, co.title as course_name, inst.first_name as inst_first, inst.last_name as inst_last
                    FROM certificates c
                    JOIN courses co ON c.course_id = co.course_id
                    JOIN users inst ON co.instructor_id = inst.user_id
                    WHERE c.user_id = @user_id
                `);
            return result.recordset;
        } catch (err) {
            console.error("Error fetching student certificates: ", err);
            throw err;
        }
    }

    static async verify(certificate_id) {
        try {
            const pool = await poolPromise;

            const parts = certificate_id.split("-");
            let user_id, course_id;

            if (parts.length === 3 && parts[0] === "NEX") {
                user_id = parts[1];
                course_id = parts[2];
            } else if (parts.length === 2) {
                user_id = parts[0];
                course_id = parts[1];
            } else {
                return null;
            }

            if (!user_id || !course_id) return null;

            const result = await pool
                .request()
                .input("user_id", sql.Int, parseInt(user_id))
                .input("course_id", sql.Int, parseInt(course_id)).query(`
                    SELECT c.*, u.first_name, u.last_name, co.title as course_name 
                    FROM certificates c
                    LEFT JOIN users u ON c.user_id = u.user_id
                    LEFT JOIN courses co ON c.course_id = co.course_id
                    WHERE c.user_id = @user_id AND c.course_id = @course_id
                `);
            
            const cert = result.recordset[0];
            if (!cert) return null;

            if (!cert.first_name || !cert.course_name) {
                return { ...cert, is_invalid: true };
            }

            return cert;
        } catch (err) {
            console.error("Error verifying certificate: ", err);
            throw err;
        }
    }
}

export default Certificate;
