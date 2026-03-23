"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultErrorHandler = void 0;
const domain_error_1 = require("../../domain/errors/domain-error");
class DefaultErrorHandler {
    logger;
    isDevelopment;
    constructor(logger, isDevelopment = false) {
        this.logger = logger;
        this.isDevelopment = isDevelopment;
    }
    handleError(error) {
        this.logger.error('An error occurred', error);
        if (error instanceof domain_error_1.AuthError) {
            return this.handleAuthError(error);
        }
        else if (error instanceof domain_error_1.CognitiveError) {
            return this.handleCognitiveError(error);
        }
        else if (error instanceof domain_error_1.DomainError) {
            return this.handleDomainError(error);
        }
        else {
            return this.handleGenericError(error);
        }
    }
    handleAuthError(error) {
        let statusCode = 401;
        switch (error.code) {
            case 'INVALID_INPUT':
                statusCode = 400;
                break;
            case 'EMAIL_ALREADY_EXISTS':
                statusCode = 409;
                break;
            case 'USER_NOT_FOUND':
            case 'INVALID_PASSWORD':
            case 'INVALID_REFRESH_TOKEN':
                statusCode = 401;
                break;
            case 'USER_NOT_ACTIVE':
                statusCode = 403;
                break;
        }
        return {
            statusCode,
            message: error.message,
            errorCode: error.code,
            details: this.isDevelopment ? { stack: error.stack } : undefined,
        };
    }
    handleCognitiveError(error) {
        let statusCode = 400;
        switch (error.code) {
            case 'MODEL_NOT_FOUND':
            case 'THOUGHT_FRAGMENT_NOT_FOUND':
                statusCode = 404;
                break;
            case 'UNAUTHORIZED':
                statusCode = 403;
                break;
        }
        return {
            statusCode,
            message: error.message,
            errorCode: error.code,
            details: this.isDevelopment ? { stack: error.stack } : undefined,
        };
    }
    handleDomainError(error) {
        return {
            statusCode: 400,
            message: error.message,
            errorCode: error.code,
            details: this.isDevelopment ? { stack: error.stack } : undefined,
        };
    }
    handleGenericError(error) {
        return {
            statusCode: 500,
            message: 'An unexpected error occurred',
            errorCode: 'INTERNAL_SERVER_ERROR',
            details: this.isDevelopment ? { message: error.message, stack: error.stack } : undefined,
        };
    }
}
exports.DefaultErrorHandler = DefaultErrorHandler;
//# sourceMappingURL=error-handler.js.map