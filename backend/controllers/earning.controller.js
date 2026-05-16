import Earning from "../models/earning.model.js";
import { successResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getEarnings = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const is_admin = req.user.role === "admin";
    const { page = 1, limit = 10 } = req.query;

    const result = await Earning.getEarnings(user_id, is_admin, page, limit);
    return successResponse(res, result);
});

export const getEarningsAnalytics = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const is_admin = req.user.role === "admin";

    const result = await Earning.getEarningsAnalytics(user_id, is_admin);
    return successResponse(res, result);
});
