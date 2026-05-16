import { Router } from "express";
import {
    createSection,
    updateSection,
    deleteSection,
} from "../controllers/section.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    sectionSchema,
    updateSectionSchema,
} from "../validators/section.validator.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("instructor", "admin"),
    validateRequest(sectionSchema),
    createSection
);

router.put(
    "/:course_id/:section_order",
    authenticate,
    authorize("instructor", "admin"),
    validateRequest(updateSectionSchema),
    updateSection,
);

router.delete(
    "/:course_id/:section_order",
    authenticate,
    authorize("instructor", "admin"),
    deleteSection,
);

export default router;
