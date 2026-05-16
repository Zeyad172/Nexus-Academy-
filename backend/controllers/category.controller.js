import Category from "../models/category.model.js";
import Course from "../models/course.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res, next) => {
    const newCategory = await Category.create(req.body);
    return successResponse(
        res,
        newCategory,
        "Category created successfully",
        201,
    );
});

const getCategoryById = asyncHandler(async (req, res, next) => {
    const { category_id } = req.params;
    const category = await Category.findById(category_id);
    if (category) {
        return successResponse(res, category);
    } else {
        return errorResponse(res, "Category not found", 404);
    }
});

const getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.findAll();
    return successResponse(res, categories);
});

const updateCategory = asyncHandler(async (req, res, next) => {
    const { category_id } = req.params;

    const result = await Category.update(category_id, req.body);
    if (result) {
        return successResponse(res, result, "Category updated successfully");
    } else {
        return errorResponse(res, "Category not found", 404);
    }
});

const deleteCategory = asyncHandler(async (req, res, next) => {
    const { category_id } = req.params;

    const category = await Category.findById(category_id);
    if (!category) {
        return errorResponse(res, "Category not found", 404);
    }

    if (category.course_count > 0) {
        return errorResponse(
            res,
            "Cannot delete category that has courses. Please move or delete the courses first.",
            400,
        );
    }

    const result = await Category.delete(category_id);
    if (result) {
        return successResponse(res, null, "Category deleted successfully");
    } else {
        return errorResponse(res, "Category not found", 404);
    }
});

export {
    createCategory,
    getCategoryById,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
