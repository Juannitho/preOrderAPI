// Custom error classes for better error handling
export class NotFoundError extends Error {
    constructor(what = 'Resource') {
        super(`${what} not found`);
        this.name = 'NotFoundError';
    }
}

// Custom error class for conflict errors
export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}

export function handle(err, res, next) {
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof ConflictError) {
        return res.status(409).json({ error: err.message });
    }
    return next(err);
}