import { ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // req.body = validated.body;
            // req.query = validated.query;
            // req.params = validated.params;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors.map(e => e.message).join(', ') } });
            }
            else {
                next(error);
            }
        }
    };
};
//# sourceMappingURL=validate.js.map