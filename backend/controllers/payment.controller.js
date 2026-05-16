import stripe from "../config/stripe.config.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    const user_id = req.user.user_id;

    const course = await Course.findById(course_id);
    if (!course) {
        return errorResponse(res, "Course not found", 404);
    }

    if (course.instructor_id === user_id) {
        return errorResponse(res, "You cannot enroll in your own course", 400);
    }

    const alreadyEnrolled = await Enrollment.isEnrolled(user_id, course_id);
    if (alreadyEnrolled) {
        return errorResponse(res, "Already enrolled in this course", 400);
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: course.title,
                        description: course.description,
                        images: course.thumbnail_url
                            ? [course.thumbnail_url]
                            : [],
                    },
                    unit_amount: course.price
                        ? Math.round(course.price * 100)
                        : course.original_price
                          ? Math.round(course.original_price * 100)
                          : 0,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course_id}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-failed?course_id=${course_id}`,
        metadata: {
            course_id: course_id.toString(),
            user_id: user_id.toString(),
        },
    });

    return successResponse(res, { sessionId: session.id, url: session.url });
});

export const stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { course_id, user_id } = session.metadata;

        try {
            await Enrollment.create(
                Number(user_id),
                Number(course_id),
                "stripe",
                session.id,
            );
        } catch (enrollErr) {
            console.error("Enrollment creation failed:", enrollErr);
        }
    }

    res.json({ received: true });
});
