import Course from "../models/course.model.js";
import Category from "../models/category.model.js";
import Section from "../models/section.model.js";
import Lesson from "../models/lesson.model.js";
import Enrollment from "../models/enrollment.model.js";
import { uploadToDrive, deleteFromDrive } from "../services/drive.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCourse = asyncHandler(async (req, res, next) => {
    let courseThumbnailUrl = null;
    try {
        const { category_id } = req.body;

        const category = await Category.findById(category_id);
        if (!category) {
            return errorResponse(res, "Category not found", 404);
        }

        if (req.file) {
            const uploadResult = await uploadToDrive(req.file);
            courseThumbnailUrl = uploadResult.fileId;
        }

        const newCourse = await Course.create({
            ...req.body,
            instructor_id: req.user.user_id,
            thumbnail_url: courseThumbnailUrl,
        });

        return successResponse(
            res,
            newCourse,
            "Course created successfully",
            201,
        );
    } catch (err) {
        if (courseThumbnailUrl) {
            await deleteFromDrive(courseThumbnailUrl).catch((cleanupErr) =>
                console.error(
                    "Failed to cleanup uploaded thumbnail after error:",
                    cleanupErr,
                ),
            );
        }
        throw err;
    }
});

const getCourseById = asyncHandler(async (req, res, next) => {
    const { course_id } = req.params;
    const userId = req.user?.user_id || null;
    const isAdmin = req.user?.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);
    if (course) {
        let is_enrolled = false;
        if (userId) {
            is_enrolled =
                isAdmin ||
                course.instructor_id === userId ||
                (await Enrollment.isEnrolled(userId, course_id));
        }
        return successResponse(res, { ...course, is_enrolled });
    } else {
        return errorResponse(res, "Course not found", 404);
    }
});

const getAllCourses = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        search,
        category_id,
        level,
        is_available,
        sortBy = "Time",
        order = "ASC",
    } = req.query;
    const userId = req.user?.user_id || null;
    const isAdmin = req.user?.role === "admin";

    const sortMap = {
        Title: "title",
        Price: "price",
        Rating: "rating",
        Duration: "duration",
        Time: "created_at",
    };

    const sortColumn = sortMap[sortBy] || "created_at";

    const { courses, total } = await Course.find(
        Number(page),
        Number(limit),
        userId,
        isAdmin,
        {
            search,
            category_id,
            level,
            is_available:
                is_available === undefined
                    ? undefined
                    : is_available === "true",
        },
        sortColumn,
        order,
    );
    return successResponse(res, { courses, total });
});

const getMyCourses = asyncHandler(async (req, res, next) => {
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";
    const {
        page = 1,
        limit = 10,
        search,
        category_id,
        is_available,
    } = req.query;

    const { courses, total } = await Course.findByInstructorId(
        userId,
        userId,
        isAdmin,
        Number(page),
        Number(limit),
        {
            search,
            category_id: category_id ? Number(category_id) : null,
            is_available:
                is_available === undefined
                    ? undefined
                    : is_available === "true",
        },
    );
    return successResponse(res, { courses, total });
});

const getCoursesByInstructorId = asyncHandler(async (req, res, next) => {
    const { instructor_id } = req.params;
    const userId = req.user?.user_id || null;
    const isAdmin = req.user?.role === "admin";
    const {
        page = 1,
        limit = 10,
        search,
        category_id,
        is_available,
    } = req.query;

    const { courses, total } = await Course.findByInstructorId(
        Number(instructor_id),
        userId,
        isAdmin,
        Number(page),
        Number(limit),
        {
            search,
            category_id: category_id ? Number(category_id) : null,
            is_available:
                is_available === undefined
                    ? undefined
                    : is_available === "true",
        },
    );

    return successResponse(res, { courses, total });
});

const updateCourse = asyncHandler(async (req, res, next) => {
    let newThumbnailUrl = null;
    try {
        const { course_id } = req.params;

        const userId = req.user.user_id;
        const isAdmin = req.user.role === "admin";

        const existingCourse = await Course.findById(
            course_id,
            userId,
            isAdmin,
        );
        if (!existingCourse) {
            return errorResponse(res, "Course not found", 404);
        }

        if (
            req.user.role !== "admin" &&
            Number(existingCourse.instructor_id) !== Number(req.user.user_id)
        ) {
            return errorResponse(
                res,
                "Forbidden: You are not authorized to update this course",
                403,
            );
        }

        const { category_id } = req.body;
        if (category_id) {
            const category = await Category.findById(category_id);
            if (!category) {
                return errorResponse(res, "Category not found", 404);
            }
        }

        const updateData = { ...req.body };
        delete updateData.instructor_id;

        if (req.file) {
            const uploadResult = await uploadToDrive(req.file);
            newThumbnailUrl = uploadResult.fileId;
            updateData.thumbnail_url = newThumbnailUrl;
        }

        const result = await Course.update(course_id, updateData);
        if (result) {
            if (newThumbnailUrl && existingCourse.thumbnail_url) {
                await deleteFromDrive(existingCourse.thumbnail_url).catch(
                    (err) =>
                        console.error(
                            "Failed to delete old thumbnail from drive:",
                            err,
                        ),
                );
            }
            return successResponse(
                res,
                {
                    ...result,
                    thumbnail_url:
                        updateData.thumbnail_url ||
                        existingCourse.thumbnail_url,
                },
                "Course updated successfully",
            );
        } else {
            if (newThumbnailUrl) {
                await deleteFromDrive(newThumbnailUrl).catch((err) =>
                    console.error("Failed to cleanup uploaded thumbnail:", err),
                );
            }
            return errorResponse(res, "Course not found", 404);
        }
    } catch (err) {
        if (newThumbnailUrl) {
            await deleteFromDrive(newThumbnailUrl).catch((cleanupErr) =>
                console.error(
                    "Failed to cleanup uploaded thumbnail after error:",
                    cleanupErr,
                ),
            );
        }
        throw err;
    }
});

const deleteCourse = asyncHandler(async (req, res, next) => {
    const { course_id } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);
    if (!course) {
        return errorResponse(res, "Course not found", 404);
    }

    if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.user_id)
    ) {
        return errorResponse(
            res,
            "Forbidden: You are not authorized to delete this course",
            403,
        );
    }

    const lessons = await Lesson.findByCourseId(course_id);

    if (course.thumbnail_url) {
        await deleteFromDrive(course.thumbnail_url).catch((err) =>
            console.error("Failed to delete course thumbnail from drive:", err),
        );
    }

    for (const lesson of lessons) {
        if (lesson.video_url) {
            await deleteFromDrive(lesson.video_url).catch((err) =>
                console.error(
                    `Failed to delete video for lesson ${lesson.lesson_order} of course ${course_id} from drive:`,
                    err,
                ),
            );
        }
    }

    const result = await Course.delete(course_id);
    if (result) {
        return successResponse(res, null, "Course deleted successfully");
    } else {
        return errorResponse(res, "Course not found", 404);
    }
});

const getCourseContent = asyncHandler(async (req, res, next) => {
    const { course_id } = req.params;
    const userId = req.user?.user_id || null;
    const role = req.user?.role;

    const course = await Course.findById(course_id, userId, role === "admin");
    if (!course) {
        return errorResponse(res, "Course not found", 404);
    }

    const isEnrolled =
        userId &&
        (role === "admin" ||
            Number(course.instructor_id) === Number(userId) ||
            (await Enrollment.isEnrolled(userId, course_id)));

    const sections = await Section.findByCourseId(course_id);
    const lessons = await Lesson.findByCourseId(course_id);

    let completedLessonIds = new Set();
    if (userId && isEnrolled) {
        const completed = await Lesson.getCompletedLessons(userId, course_id);
        completed.forEach((l) => {
            completedLessonIds.add(`${l.section_order}-${l.lesson_order}`);
        });
    }

    const structuredContent = sections.map((section) => {
        const { course_id: _, ...sectionData } = section;

        return {
            ...sectionData,
            lessons: lessons
                .filter(
                    (lesson) =>
                        Number(lesson.section_order) ===
                        Number(section.section_order),
                )
                .map((lesson) => {
                    const {
                        course_id: _,
                        section_order: __,
                        ...lessonData
                    } = lesson;

                    if (isEnrolled) {
                        return {
                            ...lessonData,
                            is_completed: completedLessonIds.has(
                                `${lesson.section_order}-${lesson.lesson_order}`,
                            ),
                        };
                    } else {
                        // Public view: only show titles and orders
                        return {
                            lesson_order: lessonData.lesson_order,
                            title: lessonData.title,
                            duration: lessonData.duration,
                        };
                    }
                }),
        };
    });

    return successResponse(res, {
        course_id: course.course_id,
        title: course.title,
        duration: course.duration,
        is_enrolled: !!isEnrolled,
        sections: structuredContent,
    });
});

const getCourseStats = asyncHandler(async (req, res, next) => {
    const { course_id } = req.params;

    const stats = await Course.getCourseStats(course_id);
    if (!stats) {
        return errorResponse(res, "Course not found", 404);
    }

    return successResponse(res, stats);
});

export {
    createCourse,
    getCourseById,
    getAllCourses,
    getMyCourses,
    getCoursesByInstructorId,
    updateCourse,
    deleteCourse,
    getCourseContent,
    getCourseStats,
};
