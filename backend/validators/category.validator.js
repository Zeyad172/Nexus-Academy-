import Joi from "joi";

const categorySchema = Joi.object({
    name: Joi.string().required().max(100),
});

export { categorySchema };
