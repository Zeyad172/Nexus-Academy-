import Review from "../models/review.model.js";
import Enrollment from "../models/enrollment.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { course_id } = req.params;
    const { rating, comment } = req.body;

    const isEnrolled = await Enrollment.isEnrolled(user_id, course_id);
    if (!isEnrolled) {
        return errorResponse(
            res,
            "You must be enrolled to review this course",
            403,
        );
    }

    const existingReview = await Review.find(user_id, course_id);
    if (existingReview) {
        return errorResponse(res, "You have already reviewed this course", 400);
    }

    await Review.create(user_id, course_id, rating, comment);
    return successResponse(res, null, "Review added successfully", 201);
});

export const getAllReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, course_id, rating, search } = req.query;

    const { reviews, total } = await Review.findGlobal(
        Number(page),
        Number(limit),
        {
            course_id: course_id ? Number(course_id) : null,
            rating: rating ? Number(rating) : null,
            search: search || null,
        }
    );
    return successResponse(res, { reviews, total });
});

export const getBestReviews = asyncHandler(async (req, res) => {
    const { limit = 3 } = req.query;

    const reviews = await Review.findBestReviews(Number(limit));
    return successResponse(res, { reviews });
});

export const getReview = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.user.user_id;

    const review = await Review.find(user_id, course_id);
    if (!review) return errorResponse(res, "Review not found", 404);
    return successResponse(res, review);
});

export const getCourseReviews = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const { page = 1, limit = 10, sortBy = "Rating", order = "DESC" } = req.query;

    const sortMap = {
        "Rating": "rating",
        "Time": "reviewed_at"
    };

    const sortColumn = sortMap[sortBy] || "rating";

    const { reviews, total } = await Review.findByCourseId(
        course_id,
        Number(page),
        Number(limit),
        sortColumn,
        order,
    );
    return successResponse(res, { reviews, total });
});

export const getInstructorReviews = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { page = 1, limit = 10, course_id, rating, search } = req.query;

    const { reviews, total } = await Review.findByInstructorId(
        user_id,
        Number(page),
        Number(limit),
        course_id ? Number(course_id) : null,
        rating ? Number(rating) : null,
        search || null,
    );
    return successResponse(res, { reviews, total });
});

export const updateReview = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.user_id;

    const review = await Review.find(user_id, course_id);
    if (!review) return errorResponse(res, "Review not found", 404);

    await Review.update(user_id, course_id, rating, comment);
    return successResponse(res, null, "Review updated successfully");
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const { user_id: target_user_id } = req.query;
    const requester_id = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const userIdToDelete = (isAdmin && target_user_id) ? target_user_id : requester_id;

    const review = await Review.find(userIdToDelete, course_id);
    if (!review) return errorResponse(res, "Review not found", 404);

    if (review.user_id !== requester_id && !isAdmin) {
        return errorResponse(res, "Forbidden: You can only delete your own reviews", 403);
    }

    await Review.delete(userIdToDelete, course_id);
    return successResponse(res, null, "Review deleted successfully");
});
