import { Router } from "express";
import {
    createCategory,
    getCategoryById,
    getAllCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import {
    authenticate,
    authorize,
    optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { categorySchema } from "../validators/category.validator.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:category_id", getCategoryById);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    validateRequest(categorySchema),
    createCategory,
);
router.put(
    "/:category_id",
    authenticate,
    authorize("admin"),
    validateRequest(categorySchema),
    updateCategory,
);
router.delete(
    "/:category_id",
    authenticate,
    authorize("admin"),
    deleteCategory,
);

export default router;
