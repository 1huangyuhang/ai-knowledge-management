import { CacheService } from '../../domain/services/cache-service';
export declare class CacheInvalidator {
    private readonly cacheService;
    constructor(cacheService: CacheService);
    invalidate(key: string): Promise<void>;
    invalidateBatch(keys: string[]): Promise<void>;
    invalidatePattern(pattern: string, keys?: string[]): Promise<void>;
    scheduleInvalidation(key: string, delay: number): NodeJS.Timeout;
    cancelInvalidation(timeoutId: NodeJS.Timeout): void;
    private matchesPattern;
}
//# sourceMappingURL=cache-invalidator.d.ts.map