import Joi from "joi";

const registerSchema = Joi.object({
    first_name: Joi.string().required().max(50),
    last_name: Joi.string().required().max(50),
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Confirm password must match password",
        }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().required(),
});

const resendOtpSchema = Joi.object({
    email: Joi.string().email().required().max(255),
});

const changePasswordSchema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().min(6).required(),
    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
            "any.only": "Confirm password must match new password",
        }),
});

const updateUserSchema = Joi.object({
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    title: Joi.string().max(70).optional(),
    bio: Joi.string().max(255).optional(),
    role: Joi.string().valid("user", "instructor", "admin"),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().max(255),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required().max(255),
    otp: Joi.string().length(6).required(),
    new_password: Joi.string().min(6).required(),
    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
            "any.only": "Confirm password must match new password",
        }),
});

export {
    registerSchema,
    loginSchema,
    resendOtpSchema,
    changePasswordSchema,
    updateUserSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
