"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.ValidationError = exports.CognitiveError = exports.AuthError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = this.constructor.name;
        if (cause) {
            this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
        }
    }
}
exports.DomainError = DomainError;
class AuthError extends DomainError {
    code;
    statusCode = 401;
    constructor(message, code = 'AUTH_ERROR', cause) {
        super(message, cause);
        this.code = code;
    }
}
exports.AuthError = AuthError;
class CognitiveError extends DomainError {
    code;
    statusCode = 400;
    constructor(message, code = 'COGNITIVE_ERROR', cause) {
        super(message, cause);
        this.code = code;
    }
}
exports.CognitiveError = CognitiveError;
class ValidationError extends DomainError {
    details;
    code = 'VALIDATION_ERROR';
    statusCode = 400;
    constructor(message, details, cause) {
        super(message, cause);
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends DomainError {
    code;
    statusCode = 404;
    constructor(message, code = 'NOT_FOUND_ERROR', cause) {
        super(message, cause);
        this.code = code;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends DomainError {
    code = 'INTERNAL_SERVER_ERROR';
    statusCode = 500;
    constructor(message, cause) {
        super(message, cause);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=domain-error.js.map