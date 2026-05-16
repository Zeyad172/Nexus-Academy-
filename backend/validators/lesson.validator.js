import Joi from "joi";

const lessonSchema = Joi.object({
    course_id: Joi.number().integer().required(),
    section_order: Joi.number().integer().required(),
    lesson_order: Joi.number().integer().required(),
    title: Joi.string().max(255).required(),
    description: Joi.string().allow("").max(1000),
});

const updateLessonSchema = Joi.object({
    section_order: Joi.number().integer(),
    lesson_order: Joi.number().integer(),
    title: Joi.string().max(255),
    description: Joi.string().allow("").max(1000),
});

export { lessonSchema, updateLessonSchema };
