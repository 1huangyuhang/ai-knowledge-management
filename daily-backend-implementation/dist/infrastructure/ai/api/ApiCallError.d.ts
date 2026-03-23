export declare class ApiCallError extends Error {
    statusCode?: number;
    errorData?: any;
    constructor(message: string, statusCode?: number, errorData?: any);
}
export declare class ApiTimeoutError extends ApiCallError {
    constructor(message?: string);
}
export declare class ApiServiceUnavailableError extends ApiCallError {
    constructor(message?: string);
}
//# sourceMappingURL=ApiCallError.d.ts.map