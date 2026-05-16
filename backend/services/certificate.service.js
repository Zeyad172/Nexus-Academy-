import fs from "fs";
import path from "path";
import { sendEmail } from "../utils/sendEmail.js";
import Certificate from "../models/certificate.model.js";
import puppeteer from "puppeteer";

const certificateTemplatePath = path.resolve("templates", "certificate.html");
const emailTemplatePath = path.resolve("templates", "certificateEmail.html");

export const generateCertificateHtml = async (userId, courseId) => {
    let cert = await Certificate.getByStudentAndCourse(userId, courseId);
    if (!cert) {
        await Certificate.issue(userId, courseId);
        cert = await Certificate.getByStudentAndCourse(userId, courseId);
    }

    let template = await fs.promises.readFile(certificateTemplatePath, "utf8");

    return template
        .replace("{{certificateId}}", `NEX-${cert.user_id}-${cert.course_id}`)
        .replace("{{studentName}}", `${cert.first_name} ${cert.last_name}`)
        .replace("{{courseName}}", cert.course_name)
        .replace("{{date}}", new Date(cert.issue_date).toLocaleDateString())
        .replace("{{instructorName}}", `${cert.inst_first} ${cert.inst_last}`);
};

export const generateCertificatePdfBuffer = async (html) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        return await page.pdf({
            format: "A4",
            landscape: true,
            printBackground: true,
            margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

export const sendCertificateEmail = async (userId, courseId) => {
    try {
        const cert = await Certificate.getByStudentAndCourse(userId, courseId);
        if (!cert) {
            throw new Error("Certificate not found");
        }

        let emailHtml = await fs.promises.readFile(emailTemplatePath, "utf8");

        const studentName = `${cert.first_name} ${cert.last_name}`;
        const courseName = cert.course_name;
        const certificateId = `NEX-${cert.user_id}-${cert.course_id}`;
        const date = new Date(cert.issue_date).toLocaleDateString();

        emailHtml = emailHtml
            .replace(/{{studentName}}/g, studentName)
            .replace(/{{courseName}}/g, courseName)
            .replace(/{{certificateId}}/g, certificateId)
            .replace(/{{date}}/g, date);

        const certHtml = await generateCertificateHtml(userId, courseId);
        const pdfBuffer = await generateCertificatePdfBuffer(certHtml);

        const attachments = [
            {
                filename: `certificate-${courseId}.pdf`,
                content: Buffer.from(pdfBuffer).toString("base64"),
                contentType: "application/pdf",
            },
        ];

        await sendEmail(
            cert.email,
            `Congratulations! You've earned a certificate for ${courseName}`,
            emailHtml,
            attachments
        );
        
        return true;
    } catch (error) {
        console.error("Failed to send certificate email:", error);
        throw error;
    }
};
