import { CacheService } from '../../domain/services/cache-service';
export declare class MemoryCacheService implements CacheService {
    private cache;
    private cleanupInterval;
    private cleanupTimer;
    private defaultTTL;
    constructor(cleanupInterval?: number);
    private startCleanupTimer;
    private cleanupExpiredItems;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    close(): void;
}
//# sourceMappingURL=memory-cache-service.d.ts.map