import { LoggerService } from '../logging/logger.service';
export interface ErrorHandler {
    handleError(error: Error): ErrorResponse;
}
export interface ErrorResponse {
    statusCode: number;
    message: string;
    errorCode: string;
    details?: any;
}
export declare class DefaultErrorHandler implements ErrorHandler {
    private logger;
    private isDevelopment;
    constructor(logger: LoggerService, isDevelopment?: boolean);
    handleError(error: Error): ErrorResponse;
    private handleAuthError;
    private handleCognitiveError;
    private handleDomainError;
    private handleGenericError;
}
//# sourceMappingURL=error-handler.d.ts.map