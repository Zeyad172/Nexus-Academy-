import { Router } from "express";
import {
    createLesson,
    getLessonDetails,
    updateLesson,
    deleteLesson,
    completeLesson
} from "../controllers/lesson.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { verifyEnrollment } from "../middleware/enrollment.middleware.js";
import { videoUpload, fileCleanup } from "../middleware/multer.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    lessonSchema,
    updateLessonSchema,
} from "../validators/lesson.validator.js";

const router = Router();

router.get("/:course_id/:section_order/:lesson_order", authenticate, verifyEnrollment, getLessonDetails);

router.post(
    "/",
    authenticate,
    authorize("instructor", "admin"),
    videoUpload.single("video"),
    fileCleanup,
    validateRequest(lessonSchema),
    createLesson
);

router.put(
    "/:course_id/:section_order/:lesson_order",
    authenticate,
    authorize("instructor", "admin"),
    videoUpload.single("video"),
    fileCleanup,
    validateRequest(updateLessonSchema),
    updateLesson
);

router.delete(
    "/:course_id/:section_order/:lesson_order",
    authenticate,
    authorize("instructor", "admin"),
    deleteLesson
);

router.post(
    "/:course_id/:section_order/:lesson_order/complete",
    authenticate,
    authorize("user"),
    verifyEnrollment,
    completeLesson
);

export default router;
