import { RetryService } from './RetryService';
import { RetryStrategy } from './RetryStrategy';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
export declare class DefaultRetryService implements RetryService {
    private logger;
    constructor(logger: LoggerService);
    executeWithRetry<T>(operation: () => Promise<T>, strategy: RetryStrategy): Promise<T>;
    private wait;
}
//# sourceMappingURL=DefaultRetryService.d.ts.map