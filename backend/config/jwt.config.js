import jwt from "jsonwebtoken";

const generateJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
};

const verifyJWTToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

export { generateJWTToken, verifyJWTToken };
