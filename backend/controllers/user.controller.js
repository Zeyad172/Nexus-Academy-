import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";
import { uploadToDrive, deleteFromDrive } from "../services/drive.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const getUserById = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    if (req.user.role !== "admin" && req.user.user_id.toString() !== user_id) {
        return errorResponse(
            res,
            "Forbidden: You can only access your own profile",
            403,
        );
    }

    const user = await User.findById(user_id);
    if (user) {
        const {
            user_id: _,
            hashed_password,
            otp,
            otp_expires,
            is_verified,
            ...userData
        } = user;
        return successResponse(res, userData);
    } else {
        return errorResponse(res, "User not found", 404);
    }
});

const getBestInstructors = asyncHandler(async (req, res) => {
    const instructors = await User.findBestInstructors(4);
    return successResponse(res, { instructors });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "Time", order = "ASC", search = null, role = null } = req.query;

    const sortMap = {
        FirstName: "first_name",
        LastName: "last_name",
        Email: "email",
        Role: "role",
        Time: "created_at",
    };

    const sortColumn = sortMap[sortBy] || "created_at";

    const { users, total } = await User.find(
        Number(page),
        Number(limit),
        sortColumn,
        order,
        { search, role }
    );
    return successResponse(res, { users, total });
});

const updateUser = asyncHandler(async (req, res) => {
    let newAvatarUrl = null;
    const { user_id } = req.params;

    if (req.user.role !== "admin" && req.user.user_id.toString() !== user_id) {
        return errorResponse(
            res,
            "Forbidden: You can only update your own profile",
            403,
        );
    }

    const existingUser = await User.findById(user_id);
    if (!existingUser) {
        return errorResponse(res, "User not found", 404);
    }

    if (req.user.role !== "admin" && req.body.role) {
        delete req.body.role;
    }

    const updateData = { ...req.body };

    if (req.file) {
        const uploadResult = await uploadToDrive(req.file);
        newAvatarUrl = uploadResult.fileId;
        updateData.avatar_url = newAvatarUrl;
    }

    try {
        const result = await User.update(user_id, updateData);

        if (result) {
            if (newAvatarUrl && existingUser.avatar_url) {
                try {
                    await deleteFromDrive(existingUser.avatar_url);
                } catch (err) {
                    console.error(
                        "Failed to delete old avatar from drive:",
                        err,
                    );
                }
            }
            return successResponse(res, result, "User updated successfully");
        } else {
            if (newAvatarUrl) {
                await deleteFromDrive(newAvatarUrl);
            }
            return errorResponse(res, "User not found", 404);
        }
    } catch (err) {
        if (newAvatarUrl) {
            try {
                await deleteFromDrive(newAvatarUrl);
            } catch (cleanupErr) {
                console.error(
                    "Failed to cleanup uploaded avatar after error:",
                    cleanupErr,
                );
            }
        }
        throw err;
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
        return errorResponse(res, "User not found", 404);
    }

    const filesToDelete = [];
    if (user.avatar_url) filesToDelete.push(user.avatar_url);

    if (user.role === "instructor") {
        const courses = (await Course.findByInstructorId(user_id)).courses;
        for (const course of courses) {
            if (course.thumbnail_url) {
                filesToDelete.push(course.thumbnail_url);
            }
            const lessons = await Lesson.findByCourseId(course.course_id);
            for (const lesson of lessons) {
                if (lesson.video_url) {
                    filesToDelete.push(lesson.video_url);
                }
            }
        }
    }

    for (const fileUrl of filesToDelete) {
        await deleteFromDrive(fileUrl).catch((err) =>
            console.error(`Failed to delete file ${fileUrl} from drive:`, err),
        );
    }

    const result = await User.delete(user_id);
    if (result) {
        return successResponse(res, null, "User deleted successfully");
    } else {
        return errorResponse(res, "User not found", 404);
    }
});

export { getUserById, getAllUsers, updateUser, deleteUser, getBestInstructors };
