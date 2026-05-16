import { Router } from "express";
import {
    createCourse,
    getCourseById,
    getAllCourses,
    getMyCourses,
    getCoursesByInstructorId,
    updateCourse,
    deleteCourse,
    getCourseContent,
    getCourseStats,
} from "../controllers/course.controller.js";
import { getCourseReviews } from "../controllers/review.controller.js";
import { getInstructorEnrollments } from "../controllers/enrollment.controller.js";
import { getSectionsByCourseId } from "../controllers/section.controller.js";
import {
    authenticate,
    authorize,
    optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { verifyEnrollment } from "../middleware/enrollment.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    courseSchema,
    updateCourseSchema,
} from "../validators/course.validator.js";
import { imageUpload, fileCleanup } from "../middleware/multer.js";

const router = Router();

router.get("/", optionalAuthenticate, getAllCourses);

router.get("/my", authenticate, authorize("instructor"), getMyCourses);
router.get(
    "/instructor/:instructor_id",
    optionalAuthenticate,
    getCoursesByInstructorId,
);

router.get("/:course_id", optionalAuthenticate, getCourseById);

router.get(
    "/:course_id/enrollments",
    authenticate,
    authorize("instructor", "admin"),
    getInstructorEnrollments,
);

router.get("/:course_id/sections", optionalAuthenticate, getSectionsByCourseId);
router.get("/:course_id/reviews", getCourseReviews);

router.get("/:course_id/content", optionalAuthenticate, getCourseContent);

router.get(
    "/:course_id/stats",
    authenticate,
    authorize("instructor", "admin"),
    getCourseStats,
);

router.post(
    "/",
    authenticate,
    authorize("instructor"),
    imageUpload.single("thumbnail"),
    fileCleanup,
    validateRequest(courseSchema),
    createCourse,
);

router.put(
    "/:course_id",
    authenticate,
    authorize("instructor", "admin"),
    imageUpload.single("thumbnail"),
    fileCleanup,
    validateRequest(updateCourseSchema),
    updateCourse,
);

router.delete(
    "/:course_id",
    authenticate,
    authorize("instructor", "admin"),
    deleteCourse,
);

export default router;
