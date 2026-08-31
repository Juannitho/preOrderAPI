export function validate(schema) {
    return function (req, res, next) {
        // Validate the request body against the provided schema
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })),
            });
        }

        req.body = result.data;
        return next();
    };
}