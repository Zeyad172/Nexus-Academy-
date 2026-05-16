import { resend } from "../config/otp.config.js";

export const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        await resend.emails.send({
            from: "NexsusAcademy <noreply@abdelrahmanashraf.dev>",
            to,
            subject,
            html,
            attachments,
        });
    } catch (e) {
        console.error(`Error sending email: ${e}`);
        throw e;
    }
};
