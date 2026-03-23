import { CacheService } from '../../domain/services/cache-service';
export interface MultiLevelCacheConfig {
    localTtl?: number;
    distributedTtl?: number;
    cleanupInterval?: number;
}
export declare class MultiLevelCacheService implements CacheService {
    private readonly localCache;
    private readonly distributedCache?;
    private readonly config;
    constructor(distributedCache?: CacheService, config?: MultiLevelCacheConfig);
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    close(): void;
}
//# sourceMappingURL=multi-level-cache-service.d.ts.map