"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../error-handler");
const domain_error_1 = require("../../../domain/errors/domain-error");
const pino_logger_service_1 = require("../../logging/pino-logger.service");
describe('ErrorHandling Integration Tests', () => {
    let errorHandler;
    let originalConsoleError;
    let errorLogs = [];
    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = (...args) => {
            errorLogs.push(JSON.stringify(args));
            originalConsoleError(...args);
        };
        const logger = new pino_logger_service_1.PinoLoggerService();
        errorHandler = new error_handler_1.DefaultErrorHandler(logger, true);
        errorLogs = [];
    });
    afterEach(() => {
        console.error = originalConsoleError;
    });
    test('should handle auth errors', async () => {
        const error = new domain_error_1.AuthError('Invalid credentials', 'INVALID_PASSWORD');
        const response = errorHandler.handleError(error);
        expect(response.statusCode).toBe(401);
        expect(response.message).toBe('Invalid credentials');
        expect(response.errorCode).toBe('INVALID_PASSWORD');
        expect(response.details).toHaveProperty('stack');
    });
    test('should handle cognitive errors', async () => {
        const error = new domain_error_1.CognitiveError('Model not found', 'MODEL_NOT_FOUND');
        const response = errorHandler.handleError(error);
        expect(response.statusCode).toBe(404);
        expect(response.message).toBe('Model not found');
        expect(response.errorCode).toBe('MODEL_NOT_FOUND');
        expect(response.details).toHaveProperty('stack');
    });
    test('should handle domain errors', async () => {
        const error = new domain_error_1.ValidationError('Invalid input');
        const response = errorHandler.handleError(error);
        expect(response.statusCode).toBe(400);
        expect(response.message).toBe('Invalid input');
        expect(response.errorCode).toBe('VALIDATION_ERROR');
        expect(response.details).toHaveProperty('stack');
    });
    test('should handle regular errors', async () => {
        const error = new Error('Test error');
        const response = errorHandler.handleError(error);
        expect(response.statusCode).toBe(500);
        expect(response.message).toBe('An unexpected error occurred');
        expect(response.errorCode).toBe('INTERNAL_SERVER_ERROR');
        expect(response.details).toHaveProperty('message', 'Test error');
        expect(response.details).toHaveProperty('stack');
    });
    test('should handle different auth error codes', async () => {
        const invalidInputError = new domain_error_1.AuthError('Invalid input', 'INVALID_INPUT');
        const invalidInputResponse = errorHandler.handleError(invalidInputError);
        const emailExistsError = new domain_error_1.AuthError('Email already exists', 'EMAIL_ALREADY_EXISTS');
        const emailExistsResponse = errorHandler.handleError(emailExistsError);
        const userNotFoundError = new domain_error_1.AuthError('User not found', 'USER_NOT_FOUND');
        const userNotFoundResponse = errorHandler.handleError(userNotFoundError);
        const userNotActiveError = new domain_error_1.AuthError('User not active', 'USER_NOT_ACTIVE');
        const userNotActiveResponse = errorHandler.handleError(userNotActiveError);
        expect(invalidInputResponse.statusCode).toBe(400);
        expect(emailExistsResponse.statusCode).toBe(409);
        expect(userNotFoundResponse.statusCode).toBe(401);
        expect(userNotActiveResponse.statusCode).toBe(403);
    });
    test('should handle different cognitive error codes', async () => {
        const modelNotFoundError = new domain_error_1.CognitiveError('Model not found', 'MODEL_NOT_FOUND');
        const modelNotFoundResponse = errorHandler.handleError(modelNotFoundError);
        const thoughtFragmentNotFoundError = new domain_error_1.CognitiveError('Thought fragment not found', 'THOUGHT_FRAGMENT_NOT_FOUND');
        const thoughtFragmentNotFoundResponse = errorHandler.handleError(thoughtFragmentNotFoundError);
        const unauthorizedError = new domain_error_1.CognitiveError('Unauthorized', 'UNAUTHORIZED');
        const unauthorizedResponse = errorHandler.handleError(unauthorizedError);
        expect(modelNotFoundResponse.statusCode).toBe(404);
        expect(thoughtFragmentNotFoundResponse.statusCode).toBe(404);
        expect(unauthorizedResponse.statusCode).toBe(403);
    });
});
//# sourceMappingURL=error-handling-integration.test.js.map