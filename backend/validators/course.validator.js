import Joi from "joi";

const courseSchema = Joi.object({
    category_id: Joi.number().integer().required(),
    title: Joi.string().max(255).required(),
    description: Joi.string().required().max(1000),
    price: Joi.number()
        .precision(2)
        .allow(null)
        .less(Joi.ref("original_price"))
        .messages({
            "number.less":
                "Discounted price must be less than the original price",
        })
        .min(0)
        .allow(null),
    original_price: Joi.number()
        .precision(2)
        .min(0)
        .allow(null)
        .required(),
    level: Joi.string()
        .valid("Beginner", "Intermediate", "Advanced")
        .required(),
    is_available: Joi.boolean(),
});

const updateCourseSchema = Joi.object({
    category_id: Joi.number().integer(),
    title: Joi.string().max(255),
    description: Joi.string().max(1000),
    price: Joi.number()
        .precision(2)
        .less(Joi.ref("original_price"))
        .messages({
            "number.less":
                "Discounted price must be less than the original price",
        })
        .min(0)
        .allow(null),
    original_price: Joi.number()
        .precision(2)
        .min(0)
        .allow(null),
    level: Joi.string().valid("Beginner", "Intermediate", "Advanced"),
    is_available: Joi.boolean(),
});

export { courseSchema, updateCourseSchema };
