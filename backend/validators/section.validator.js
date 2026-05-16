import Joi from "joi";

const sectionSchema = Joi.object({
    course_id: Joi.number().integer().required(),
    section_order: Joi.number().integer().required(),
    title: Joi.string().max(255).required(),
});

const updateSectionSchema = Joi.object({
    section_order: Joi.number().integer(),
    title: Joi.string().max(255),
});

export { sectionSchema, updateSectionSchema };
