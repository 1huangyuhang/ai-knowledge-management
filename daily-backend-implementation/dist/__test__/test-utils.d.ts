import { DatabaseConnection } from '../infrastructure/database/database-connection';
import { InMemoryEventBus } from '../infrastructure/events/event-bus';
import { PinoLoggerService } from '../infrastructure/logging/pino-logger.service';
import { ResourceManager } from './resource-manager';
import { DefaultErrorHandler as ErrorHandler } from '../infrastructure/error/error-handler';
export declare class TestUtils {
    static createTestEnvironment(): Promise<{
        databaseConnection: DatabaseConnection;
        eventBus: InMemoryEventBus;
        logger: PinoLoggerService;
        errorHandler: ErrorHandler;
        resourceManager: ResourceManager;
    }>;
    static cleanupTestEnvironment(environment: ReturnType<typeof TestUtils.createTestEnvironment> extends Promise<infer T> ? T : never): Promise<void>;
    static sleep(ms: number): Promise<void>;
    static catchError<T extends (...args: any[]) => Promise<any>>(fn: T): Promise<Error | null>;
}
//# sourceMappingURL=test-utils.d.ts.map