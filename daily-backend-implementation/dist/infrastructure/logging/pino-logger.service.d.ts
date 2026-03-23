import { LoggerService } from './logger.service';
export interface PinoLoggerConfig {
    level: string;
    prettyPrint: boolean;
}
export declare class PinoLoggerService implements LoggerService {
    private logger;
    constructor(config?: PinoLoggerConfig);
    debug(message: string, metadata?: Record<string, any>): void;
    info(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error, metadata?: Record<string, any>): void;
    fatal(message: string, error?: Error, metadata?: Record<string, any>): void;
}
//# sourceMappingURL=pino-logger.service.d.ts.map