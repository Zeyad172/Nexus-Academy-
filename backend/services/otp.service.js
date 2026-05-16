import crypto from "crypto";
import fs from "fs";
import path from "path";
import { sendEmail } from "../utils/sendEmail.js";
import { hashPassword } from "../utils/hash.js";

const templatePath = path.resolve("templates", "otp.html");

export const generateAndSendOTP = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;
    const hashedOtp = await hashPassword(otp);

    try {
        let html = await fs.promises.readFile(templatePath, "utf8");
        html = html.replace("{{otp}}", otp);

        await sendEmail(email, "NexusAcademy - One-Time Password (OTP)", html);
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw new Error("Failed to send OTP email");
    }

    return { hashedOtp, otpExpires };
};
