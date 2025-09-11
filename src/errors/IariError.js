// src/errors/IariError.js
export class IariError extends Error {
    constructor(message, extra) {
        super(message);

        this.name = "IariError"; // good practice for debugging
        this.extra = extra;      // custom field

        // Maintains proper stack trace in V8 (Chrome, Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IariError);
        }
    }
}
