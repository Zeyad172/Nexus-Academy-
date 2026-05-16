import {
    uploadMedia,
    streamMedia,
    deleteMedia,
} from "../controllers/media.controller.js";
import { Router } from "express";
import upload, { fileCleanup } from "../middleware/multer.js";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("admin", "instructor"),
    upload.single("file"),
    fileCleanup,
    uploadMedia,
);
router.get("/:fileId", optionalAuthenticate, streamMedia);
router.delete(
    "/:fileId",
    authenticate,
    authorize("admin", "instructor"),
    deleteMedia,
);

export default router;
