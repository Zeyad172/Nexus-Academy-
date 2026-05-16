import Certificate from "../models/certificate.model.js";
import Enrollment from "../models/enrollment.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import fs from "fs";
import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import {
    sendCertificateEmail,
    generateCertificateHtml,
    generateCertificatePdfBuffer,
} from "../services/certificate.service.js";

export const getCertificate = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.user.user_id;

    const enrolled = await Enrollment.isEnrolled(user_id, course_id);
    const certExists = await Certificate.getByStudentAndCourse(
        user_id,
        course_id,
    );

    if (!enrolled && !certExists) {
        return errorResponse(
            res,
            "Not enrolled in this course and no certificate found",
            404,
        );
    }

    if (!certExists) {
        const progress = await Enrollment.getProgress(user_id, course_id);
        if (progress < 95) {
            return errorResponse(
                res,
                "Progress must be at least 95% to get certificate",
                403,
            );
        }
    }

    const html = await generateCertificateHtml(user_id, course_id);
    res.send(html);
});

export const downloadCertificate = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.user.user_id;

    const enrolled = await Enrollment.isEnrolled(user_id, course_id);
    const certExists = await Certificate.getByStudentAndCourse(
        user_id,
        course_id,
    );

    if (!enrolled && !certExists) {
        return errorResponse(
            res,
            "Not enrolled in this course and no certificate found",
            404,
        );
    }

    if (!certExists) {
        const progress = await Enrollment.getProgress(user_id, course_id);
        if (progress < 95) {
            return errorResponse(
                res,
                "Progress must be at least 95% to get certificate",
                403,
            );
        }
    }

    const html = await generateCertificateHtml(user_id, course_id);

    try {
        const pdfBuffer = await generateCertificatePdfBuffer(html);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=certificate-${course_id}.pdf`,
        );
        res.send(pdfBuffer);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        return errorResponse(
            res,
            "Failed to generate PDF: " + err.message,
            500,
        );
    }
});

export const verifyCertificate = asyncHandler(async (req, res) => {
    const { certificate_id } = req.params;
    const cert = await Certificate.verify(certificate_id);

    if (!cert) {
        return errorResponse(res, "Certificate not found", 404);
    }

    if (cert.is_invalid) {
        return errorResponse(
            res,
            "This certificate is no longer valid as the associated user or course has been deleted.",
            400,
        );
    }

    const html = await generateCertificateHtml(cert.user_id, cert.course_id);
    res.send(html);
});

export const getAllUserCertificates = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const downloadBaseUrl = `${req.protocol}://${req.get("host")}`;

    const { enrollments } = await Enrollment.findByUserId(user_id, 1, 100);

    for (const enrollment of enrollments) {
        if (enrollment.progress >= 95) {
            const certExists = await Certificate.getByStudentAndCourse(
                user_id,
                enrollment.course_id,
            );
            if (!certExists) {
                await Certificate.issue(user_id, enrollment.course_id);
                try {
                    await sendCertificateEmail(
                        user_id,
                        enrollment.course_id,
                    );
                } catch (emailError) {
                    console.error(
                        `Failed to send certificate email for course ${enrollment.course_id}:`,
                        emailError,
                    );
                }
            }
        }
    }

    const certs = await Certificate.getByStudent(user_id);

    const certsWithLinks = certs.map((cert) => ({
        ...cert,
        certificate_id: `NEX-${cert.user_id}-${cert.course_id}`,
        download_url: `/api/certificates/download/${cert.course_id}`,
    }));

    return successResponse(res, certsWithLinks);
});
