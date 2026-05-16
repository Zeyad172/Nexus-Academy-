export const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
        error.statusCode = 400;
        return next(error);
    }
    req.body = value;
    next();
};
