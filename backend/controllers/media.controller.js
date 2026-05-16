import {
    uploadToDrive,
    getDriveStream,
    deleteFromDrive,
} from "../services/drive.service.js";
import { driveConfig } from "../config/drive.config.js";
import { successResponse, errorResponse } from "../utils/response.js";
import fs from "fs";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFile } from "../utils/file.js";
import Lesson from "../models/lesson.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";

export const uploadMedia = asyncHandler(async (req, res, next) => {
    req.setTimeout(0);
    if (!req.file) return errorResponse(res, "No file uploaded.", 400);

    req.setTimeout(0);
    const result = await uploadToDrive(req.file);

    await deleteFile(req.file.path);

    return successResponse(res, result, "Media uploaded successfully", 201);
});

export const streamMedia = asyncHandler(async (req, res, next) => {
    const { fileId } = req.params;

    const lesson = await Lesson.findByVideoUrl(fileId);

    if (lesson) {
        if (!req.user) {
            return errorResponse(res, "Authentication required to stream this content", 401);
        }

        const isAdmin = req.user.role === "admin";
        const isInstructor = req.user.role === "instructor";
        
        let isCourseOwner = false;
        if (isInstructor) {
            const course = await Course.findById(lesson.course_id, req.user.user_id, false);
            if (course && Number(course.instructor_id) === Number(req.user.user_id)) {
                isCourseOwner = true;
            }
        }

        const isEnrolled = await Enrollment.isEnrolled(req.user.user_id, lesson.course_id);

        if (!isAdmin && !isCourseOwner && !isEnrolled) {
            return errorResponse(res, "Forbidden: You are not enrolled in this course", 403);
        }
    }

    const rangeHeader = req.headers.range;

    const { streamConfig, options, requestConfig } = await getDriveStream(
        fileId,
        rangeHeader,
    );

    if (rangeHeader) {
        const { start, end, fileSize, mimeType } = streamConfig;

        if (start >= fileSize) {
            res.status(416).send("Requested range not satisfiable");
            return;
        }

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=3600", 
            "Connection": "keep-alive",
        });
    } else {
        res.writeHead(200, {
            "Accept-Ranges": "bytes",
            "Content-Length": streamConfig.fileSize,
            "Content-Type": streamConfig.mimeType,
            "Cache-Control": "public, max-age=86400",
            "Connection": "keep-alive",
        });
    }

    try {
        const response = await driveConfig.files.get(options, requestConfig);

        const destroyStream = () => {
            if (response.data && !response.data.destroyed) {
                response.data.destroy();
            }
        };

        req.on("close", destroyStream);
        res.on("error", destroyStream);

        response.data
            .on("error", (e) => {
                if (e.message !== "Premature close") {
                    console.error("Drive stream error:", e);
                }
                destroyStream();
            })
            .pipe(res);
    } catch (error) {
        console.error("Error fetching stream from Drive:", error);
        if (!res.headersSent) {
            return errorResponse(res, "Error streaming media", 500);
        }
    }
});

export const deleteMedia = asyncHandler(async (req, res, next) => {
    const { fileId } = req.params;
    const result = await deleteFromDrive(fileId);
    return successResponse(res, result, "Media deleted successfully");
});
