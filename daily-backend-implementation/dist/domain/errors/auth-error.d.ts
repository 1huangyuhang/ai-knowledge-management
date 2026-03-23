import { DomainError } from './domain-error';
export declare class AuthError extends DomainError {
    constructor(message: string, errorCode: string);
    static userNotFound(email: string): AuthError;
    static invalidPassword(): AuthError;
    static userAlreadyExists(email: string): AuthError;
    static invalidToken(): AuthError;
    static tokenExpired(): AuthError;
    static userNotActive(): AuthError;
    static insufficientPermissions(): AuthError;
}
//# sourceMappingURL=auth-error.d.ts.map