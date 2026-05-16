import multer from "multer";
import path from "path";
import fs from "fs";
import { deleteFile } from "../utils/file.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.mimetype.startsWith("video/")
            ? "public/uploads/videos"
            : "public/uploads/images";

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "video/mp4",
            "video/mpeg",
            "video/quicktime",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type. Only images and videos are allowed."), false);
        }
    },
});

export const imageUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed."), false);
        }
    },
});

export const videoUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only videos are allowed."), false);
        }
    },
});

export const fileCleanup = (req, res, next) => {
    res.on("finish", async () => {
        if (res.statusCode >= 400 && req.file && req.file.path) {
            await deleteFile(req.file.path);
        }
    });
    next();
};

export default upload;
