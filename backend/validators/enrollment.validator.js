import Joi from "joi";

const enrollmentSchema = Joi.object({
    course_id: Joi.number().integer().required(),
    payment_method: Joi.string()
        .optional()
        .valid("card", "paypal", "bank_transfer", "free", "stripe"),
});

export { enrollmentSchema };
