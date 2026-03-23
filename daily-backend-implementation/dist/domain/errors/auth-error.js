"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
const domain_error_1 = require("./domain-error");
class AuthError extends domain_error_1.DomainError {
    constructor(message, errorCode) {
        super(message, errorCode);
        this.name = 'AuthError';
        Object.setPrototypeOf(this, AuthError.prototype);
    }
    static userNotFound(email) {
        return new AuthError(`User with email ${email} not found`, 'USER_NOT_FOUND');
    }
    static invalidPassword() {
        return new AuthError('Invalid password', 'INVALID_PASSWORD');
    }
    static userAlreadyExists(email) {
        return new AuthError(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS');
    }
    static invalidToken() {
        return new AuthError('Invalid authentication token', 'INVALID_TOKEN');
    }
    static tokenExpired() {
        return new AuthError('Authentication token has expired', 'TOKEN_EXPIRED');
    }
    static userNotActive() {
        return new AuthError('User account is not active', 'USER_NOT_ACTIVE');
    }
    static insufficientPermissions() {
        return new AuthError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=auth-error.js.map