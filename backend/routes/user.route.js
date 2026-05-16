import {
    getUserById,
    getAllUsers,
    getBestInstructors,
    updateUser,
    deleteUser,
} from "../controllers/user.controller.js";

import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { imageUpload, fileCleanup } from "../middleware/multer.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { updateUserSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/best-instructors", getBestInstructors);

router.use(authenticate);
router.get("/", authorize("admin"), getAllUsers);
router.get("/:user_id", getUserById);
router.put(
    "/:user_id",
    imageUpload.single("avatar"),
    fileCleanup,
    validateRequest(updateUserSchema),
    updateUser,
);
router.delete("/:user_id", authorize("admin"), deleteUser);

export default router;
