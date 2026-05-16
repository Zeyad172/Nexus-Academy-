import { Router } from "express";
import {
    createReview,
    getCourseReviews,
    getInstructorReviews,
    getAllReviews,
    getReview,
    getBestReviews,
    updateReview,
    deleteReview,
} from "../controllers/review.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { reviewSchema } from "../validators/review.validator.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAllReviews);
router.get(
    "/instructor",
    authenticate,
    authorize("instructor"),
    getInstructorReviews,
);
router.get("/best", getBestReviews);
router.get("/:course_id", getCourseReviews);
router.get("/:course_id/me", authenticate, authorize("user"), getReview);
router.post(
    "/:course_id",
    authenticate,
    authorize("user"),
    validateRequest(reviewSchema),
    createReview,
);
router.put("/:course_id", authenticate, authorize("user"), updateReview);
router.delete(
    "/:course_id",
    authenticate,
    authorize("user", "admin"),
    deleteReview,
);

export default router;
