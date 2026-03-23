"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServiceUnavailableError = exports.ApiTimeoutError = exports.ApiCallError = void 0;
class ApiCallError extends Error {
    statusCode;
    errorData;
    constructor(message, statusCode, errorData) {
        super(message);
        this.name = 'ApiCallError';
        this.statusCode = statusCode;
        this.errorData = errorData;
    }
}
exports.ApiCallError = ApiCallError;
class ApiTimeoutError extends ApiCallError {
    constructor(message = 'API request timed out') {
        super(message);
        this.name = 'ApiTimeoutError';
    }
}
exports.ApiTimeoutError = ApiTimeoutError;
class ApiServiceUnavailableError extends ApiCallError {
    constructor(message = 'API service is unavailable') {
        super(message);
        this.name = 'ApiServiceUnavailableError';
    }
}
exports.ApiServiceUnavailableError = ApiServiceUnavailableError;
//# sourceMappingURL=ApiCallError.js.map