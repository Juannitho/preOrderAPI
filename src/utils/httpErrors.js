// Custom error classes for better error handling.
// Each carries its own statusCode, so a plain `next(err)` from anywhere is
// enough for the central errorHandler middleware to respond correctly.
export class NotFoundError extends Error {
    constructor(what = 'Resource') {
        super(`${what} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

// Custom error class for conflict errors
export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}