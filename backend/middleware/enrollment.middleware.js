import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";
import { errorResponse } from "../utils/response.js";

export const verifyEnrollment = async (req, res, next) => {
    try {
        const { course_id } = req.params;
        const user_id = req.user.user_id;
        const role = req.user.role;

        const course = await Course.findById(course_id);
        if (!course) {
            return errorResponse(res, "Course not found", 404);
        }

        if (role === 'admin' || course.instructor_id === user_id) {
            return next();
        }

        const isEnrolled = await Enrollment.isEnrolled(user_id, course_id);
        if (!isEnrolled) {
            return errorResponse(res, "You are not enrolled in this course", 403);
        }
        next();
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
