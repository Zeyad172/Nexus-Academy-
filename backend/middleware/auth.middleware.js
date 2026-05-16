import { verifyJWTToken } from "../config/jwt.config.js";
import User from "../models/user.model.js";
import { errorResponse } from "../utils/response.js";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader) {
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return errorResponse(res, "Authentication required", 401);
        }

        const decoded = verifyJWTToken(token);
        
        if (!decoded || !decoded.id) {
            return errorResponse(res, "Invalid or expired token", 401);
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return errorResponse(res, "User not found", 401);
        }

        if (!user.is_verified) {
            return errorResponse(res, "Please verify your email to access this resource", 401);
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication Middleware Error:", err);
        return errorResponse(res, "Invalid or expired token", 401);
    }
};

const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader) {
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (token) {
            const decoded = verifyJWTToken(token);
            if (decoded && decoded.id) {
                const user = await User.findById(decoded.id);
                if (user && user.is_verified) {
                    req.user = user;
                }
            }
        }
        next();
    } catch (err) {
        next();
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, "Forbidden: You don't have enough permissions", 403);
        }
        next();
    };
};

export { authenticate, authorize, optionalAuthenticate };
