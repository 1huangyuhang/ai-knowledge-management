export interface CacheService {
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
}
//# sourceMappingURL=cache-service.d.ts.map