import express from "express";
import {
    enroll,
    getProgress,
    getMyEnrollments,
    getInstructorStudents,
    getInstructorEnrollments,
    getAllEnrollments,
    unenroll,
} from "../controllers/enrollment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { enrollmentSchema } from "../validators/enrollment.validator.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getAllEnrollments);
router.post(
    "/",
    authenticate,
    authorize("user"),
    validateRequest(enrollmentSchema),
    enroll,
);
router.get("/my", authenticate, authorize("user"), getMyEnrollments);
router.get(
    "/instructor/students",
    authenticate,
    authorize("instructor"),
    getInstructorStudents,
);
router.get(
    "/instructor",
    authenticate,
    authorize("instructor"),
    getInstructorEnrollments,
);
router.get(
    "/progress/:course_id",
    authenticate,
    authorize("user"),
    getProgress,
);
router.delete("/", authenticate, authorize("admin", "instructor"), unenroll);

export default router;
