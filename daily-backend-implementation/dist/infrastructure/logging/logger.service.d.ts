export interface LoggerService {
    debug(message: string, metadata?: Record<string, any>): void;
    info(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error, metadata?: Record<string, any>): void;
    fatal(message: string, error?: Error, metadata?: Record<string, any>): void;
}
//# sourceMappingURL=logger.service.d.ts.map