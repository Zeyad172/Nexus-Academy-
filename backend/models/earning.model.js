import { sql, poolPromise } from "../config/db.config.js";

class Earning {
    static async getEarnings(user_id, is_admin, page, limit) {
        const offset = (Number(page) - 1) * Number(limit);
        const pool = await poolPromise;
        const request = pool.request();
        let detailsQuery, totalRevenueQuery, countQuery;

        if (is_admin) {
            totalRevenueQuery = `
            SELECT SUM(e.enrollment_cost * 0.3) as total_revenue
            FROM enrollments e
        `;

            detailsQuery = `
            SELECT 
                u.user_id, 
                u.first_name, 
                u.last_name, 
                SUM(e.enrollment_cost * 0.3) as earning,
                SUM(e.enrollment_cost * 0.7) as instructor_earning
            FROM users u
            JOIN courses c ON u.user_id = c.instructor_id
            JOIN enrollments e ON c.course_id = e.course_id
            GROUP BY u.user_id, u.first_name, u.last_name
            ORDER BY earning DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;

            countQuery = `
            SELECT COUNT(DISTINCT u.user_id) as total
            FROM users u
            JOIN courses c ON u.user_id = c.instructor_id
            JOIN enrollments e ON c.course_id = e.course_id
        `;
        } else {
            request.input("instructor_id", sql.Int, user_id);

            totalRevenueQuery = `
            SELECT 
                SUM(e.enrollment_cost * 0.7) as total_revenue,
                COUNT(e.user_id) as total_students_overall
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE c.instructor_id = @instructor_id
        `;

            detailsQuery = `
            SELECT 
                c.course_id, 
                c.title, 
                COUNT(e.user_id) as total_students, 
                SUM(ISNULL(e.enrollment_cost, 0) * 0.7) as earning
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id
            WHERE c.instructor_id = @instructor_id
            GROUP BY c.course_id, c.title
            ORDER BY earning DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;

            countQuery = `
            SELECT COUNT(*) as total
            FROM courses
            WHERE instructor_id = @instructor_id
        `;
        }

        request.input("limit", sql.Int, Number(limit));
        request.input("offset", sql.Int, offset);

        const totalRevenueResult = await request.query(totalRevenueQuery);
        const detailsResult = await request.query(detailsQuery);
        const countResult = await request.query(countQuery);
        return {
            total_revenue: totalRevenueResult.recordset[0].total_revenue || 0,
            total_students_overall:
                totalRevenueResult.recordset[0].total_students_overall || 0,
            details: detailsResult.recordset,
            total: countResult.recordset[0].total || 0,
        };
    }

    static async getEarningsAnalytics(user_id, is_admin) {
        const pool = await poolPromise;
        let query;
        if (is_admin) {
            query = `
                    SELECT 
                        FORMAT(e.enrolled_at, 'yyyy-MM') as month,
                        SUM(e.enrollment_cost * 0.3) as revenue
                    FROM enrollments e
                    GROUP BY FORMAT(e.enrolled_at, 'yyyy-MM')
                    ORDER BY month ASC
                `;
        } else {
            query = `
                    SELECT 
                        FORMAT(e.enrolled_at, 'yyyy-MM') as month,
                        SUM(e.enrollment_cost * 0.7) as revenue
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.course_id
                    WHERE c.instructor_id = @instructor_id
                    AND e.enrolled_at >= DATEADD(month, -11, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
                    GROUP BY FORMAT(e.enrolled_at, 'yyyy-MM')
                    ORDER BY month ASC
                `;
        }

        const request = pool.request();
        if (!is_admin) request.input("instructor_id", sql.Int, user_id);
        const result = await request.query(query);
        const data = result.recordset;

        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const monthLabel = d.toLocaleString("default", { month: "short" });

            const existing = data.find((item) => item.month === monthStr);
            last12Months.push({
                month: monthLabel,
                revenue: existing ? existing.revenue : 0,
            });
        }

        return last12Months;
    }
}

export default Earning;
