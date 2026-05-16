import fs from "fs";
import { errorResponse } from "../utils/response.js";
import { deleteFile } from "../utils/file.js";

const errorHandler = async (err, req, res, next) => {
    if (req.file) {
        await deleteFile(req.file.path);
    }
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            await deleteFile(file.path);
        }
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return errorResponse(res, message, statusCode, err);
};

export default errorHandler;
