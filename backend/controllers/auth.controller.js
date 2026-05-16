import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateJWTToken } from "../config/jwt.config.js";
import { uploadToDrive, deleteFromDrive } from "../services/drive.service.js";
import { generateAndSendOTP } from "../services/otp.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

import { deleteFile } from "../utils/file.js";

const register = asyncHandler(async (req, res) => {
    let avatarUrl = null;
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
        if (req.file) {
            await deleteFile(req.file.path);
        }
        if (!existingUser.is_verified) {
            const { hashedOtp, otpExpires } = await generateAndSendOTP(
                req.body.email,
            );
            await User.updateOTP(req.body.email, hashedOtp, otpExpires);
            return successResponse(
                res,
                null,
                "OTP resent. Please verify your email.",
            );
        }
        return errorResponse(res, "Email already in use", 400);
    }
    const { password, ...userData } = req.body;
    const hashedPassword = await hashPassword(password);

    if (req.file) {
        const uploadResult = await uploadToDrive(req.file);
        avatarUrl = uploadResult.fileId;
    }

    const { hashedOtp, otpExpires } = await generateAndSendOTP(req.body.email);

    try {
        await User.create({
            ...userData,
            hashed_password: hashedPassword,
            avatar_url: avatarUrl,
            otp: hashedOtp,
            otp_expires: otpExpires,
            is_verified: false,
        });

        return successResponse(
            res,
            null,
            "OTP sent. Please verify to complete registration.",
        );
    } catch (err) {
        if (avatarUrl) {
            try {
                await deleteFromDrive(avatarUrl);
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

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return errorResponse(res, "User not found", 404);

    if (user.is_verified)
        return errorResponse(res, "User already verified", 400);

    if (Date.now() > user.otp_expires) {
        return errorResponse(res, "OTP expired. Please resend the code.", 400);
    }

    const isOtpValid = await comparePassword(otp, user.otp);
    if (!isOtpValid) return errorResponse(res, "Invalid OTP", 400);

    await User.verify(email);

    return successResponse(res, null, "User registered successfully", 201);
});

const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return errorResponse(res, "User not found", 404);

    if (user.is_verified) {
        return errorResponse(
            res,
            "Email already verified. Please log in.",
            400,
        );
    }

    const { hashedOtp, otpExpires } = await generateAndSendOTP(email);
    await User.updateOTP(email, hashedOtp, otpExpires);

    return successResponse(res, null, "OTP resent successfully.");
});

const login = asyncHandler(async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user) return errorResponse(res, "Invalid credentials", 401);

    if (!user.is_verified)
        return errorResponse(
            res,
            "User not verified, Verify OTP and try again.",
            401,
        );

    const match = await comparePassword(
        req.body.password,
        user.hashed_password,
    );
    if (!match) return errorResponse(res, "Invalid credentials", 401);

    const token = generateJWTToken({
        id: user.user_id,
        role: user.role,
    });

    // Only use secure cookies if we are on HTTPS or in a production environment
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "None" : "Lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    return successResponse(
        res,
        {
            token, // Included for clients that prefer headers
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            title: user.title,
            bio: user.bio,
            created_at: user.created_at,
        },
        "Logged in successfully",
    );
});

const me = asyncHandler(async (req, res) => {
    const {
        user_id,
        hashed_password,
        otp,
        otp_expires,
        is_verified,
        ...userData
    } = req.user;
    return successResponse(res, { id: user_id, ...userData });
});

const changePassword = asyncHandler(async (req, res) => {
    const { old_password, new_password } = req.body;
    const user = req.user;

    const match = await comparePassword(old_password, user.hashed_password);
    if (!match) return errorResponse(res, "Invalid old password", 401);

    const hashedPassword = await hashPassword(new_password);
    await User.update(user.user_id, { hashed_password: hashedPassword });

    return successResponse(res, null, "Password updated successfully");
});

const logout = asyncHandler(async (req, res) => {
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "None" : "Lax",
    });
    return successResponse(res, null, "Logged out successfully");
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
        return successResponse(
            res,
            null,
            "If an account exists for this email, an OTP has been sent.",
        );
    }

    const { hashedOtp, otpExpires } = await generateAndSendOTP(email);
    await User.updateOTP(email, hashedOtp, otpExpires);

    return successResponse(
        res,
        null,
        "If an account exists for this email, an OTP has been sent.",
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, new_password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) return errorResponse(res, "Invalid request", 400);

    if (Date.now() > user.otp_expires) {
        return errorResponse(res, "OTP expired. Please try again.", 400);
    }

    const isOtpValid = await comparePassword(otp, user.otp);
    if (!isOtpValid) return errorResponse(res, "Invalid OTP", 400);

    const hashedPassword = await hashPassword(new_password);
    await User.update(user.user_id, {
        hashed_password: hashedPassword,
        otp: null,
        otp_expires: null,
    });

    return successResponse(
        res,
        null,
        "Password reset successfully. You can now log in.",
    );
});

const googleAuthCallback = asyncHandler(async (req, res) => {
    const user = req.user;

    const token = generateJWTToken({
        id: user.user_id,
        role: user.role,
    });

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "None" : "Lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    res.redirect(process.env.FRONTEND_URL);
});

export {
    register,
    login,
    verifyOtp,
    resendOtp,
    me,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
    googleAuthCallback,
};
