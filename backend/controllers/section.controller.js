import Section from "../models/section.model.js";
import Lesson from "../models/lesson.model.js";
import Course from "../models/course.model.js";
import { deleteFromDrive } from "../services/drive.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const createSection = asyncHandler(async (req, res, next) => {
    const { course_id, section_order } = req.body;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);
    if (!course) return errorResponse(res, "Course not found", 404);

    if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.user_id)
    ) {
        console.log(course.instructor_id, req.user.user_id);
        return errorResponse(
            res,
            "Forbidden: You are not authorized to add sections to this course",
            403,
        );
    }

    const existingSection = await Section.findOne(course_id, section_order);
    if (existingSection)
        return errorResponse(
            res,
            "Section with this order already exists",
            400,
        );

    const newSection = await Section.create(req.body);
    return successResponse(
        res,
        newSection,
        "Section created successfully",
        201,
    );
});

const getSectionsByCourseId = asyncHandler(async (req, res, next) => {
    const { course_id } = req.params;
    const userId = req.user?.user_id || null;
    const isAdmin = req.user?.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);

    if (!course) return errorResponse(res, "Course not found", 404);

    const sections = await Section.findByCourseId(course_id);
    const cleanSections = sections.map(
        ({ course_id: _, ...sectionData }) => sectionData,
    );

    return successResponse(res, cleanSections);
});

const updateSection = asyncHandler(async (req, res, next) => {
    const { course_id, section_order } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);
    if (!course) return errorResponse(res, "Course not found", 404);

    if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.user_id)
    ) {
        return errorResponse(
            res,
            "Forbidden: You are not authorized to update this section",
            403,
        );
    }

    const result = await Section.update(course_id, section_order, req.body);
    if (result) {
        return successResponse(res, null, "Section updated successfully");
    } else {
        return errorResponse(res, "Section not found", 404);
    }
});

const deleteSection = asyncHandler(async (req, res, next) => {
    const { course_id, section_order } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const course = await Course.findById(course_id, userId, isAdmin);
    if (!course) return errorResponse(res, "Course not found", 404);

    if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.user_id)
    ) {
        return errorResponse(
            res,
            "Forbidden: You are not authorized to delete this section",
            403,
        );
    }

    const section = await Section.findOne(course_id, section_order);
    if (!section) return errorResponse(res, "Section not found", 404);

    const lessons = await Lesson.findBySection(course_id, section_order);

    for (const lesson of lessons) {
        if (lesson.video_url) {
            try {
                await deleteFromDrive(lesson.video_url);
            } catch (err) {
                console.error(
                    `Failed to delete video for lesson ${lesson.lesson_order} from drive:`,
                    err,
                );
            }
        }
    }

    const result = await Section.delete(course_id, section_order);
    if (result) {
        return successResponse(res, null, "Section deleted successfully");
    } else {
        return errorResponse(res, "Section not found", 404);
    }
});

export { createSection, getSectionsByCourseId, updateSection, deleteSection };
