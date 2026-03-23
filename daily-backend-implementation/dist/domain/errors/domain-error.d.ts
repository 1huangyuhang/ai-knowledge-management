export declare abstract class DomainError extends Error {
    abstract readonly code: string;
    abstract readonly statusCode: number;
    constructor(message: string, cause?: Error);
}
export declare class AuthError extends DomainError {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code?: string, cause?: Error);
}
export declare class CognitiveError extends DomainError {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code?: string, cause?: Error);
}
export declare class ValidationError extends DomainError {
    readonly details?: Record<string, string[]> | undefined;
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, details?: Record<string, string[]> | undefined, cause?: Error);
}
export declare class NotFoundError extends DomainError {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code?: string, cause?: Error);
}
export declare class InternalServerError extends DomainError {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, cause?: Error);
}
//# sourceMappingURL=domain-error.d.ts.map