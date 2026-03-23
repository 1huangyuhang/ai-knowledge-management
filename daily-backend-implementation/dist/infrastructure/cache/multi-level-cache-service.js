"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLevelCacheService = void 0;
const memory_cache_service_1 = require("./memory-cache-service");
class MultiLevelCacheService {
    localCache;
    distributedCache;
    config;
    constructor(distributedCache, config = {}) {
        this.distributedCache = distributedCache;
        this.config = {
            localTtl: 5 * 60 * 1000,
            distributedTtl: 3600 * 1000,
            cleanupInterval: 5 * 60 * 1000,
            ...config
        };
        this.localCache = new memory_cache_service_1.MemoryCacheService(this.config.cleanupInterval);
    }
    async set(key, value, ttl) {
        await this.localCache.set(key, value, ttl || this.config.localTtl);
        if (this.distributedCache) {
            await this.distributedCache.set(key, value, ttl || this.config.distributedTtl);
        }
    }
    async get(key) {
        let value = await this.localCache.get(key);
        if (value !== null) {
            return value;
        }
        if (this.distributedCache) {
            value = await this.distributedCache.get(key);
            if (value !== null) {
                await this.localCache.set(key, value, this.config.localTtl);
                return value;
            }
        }
        return null;
    }
    async delete(key) {
        await this.localCache.delete(key);
        if (this.distributedCache) {
            await this.distributedCache.delete(key);
        }
    }
    async clear() {
        await this.localCache.clear();
        if (this.distributedCache) {
            await this.distributedCache.clear();
        }
    }
    async has(key) {
        let exists = await this.localCache.has(key);
        if (exists) {
            return true;
        }
        if (this.distributedCache) {
            exists = await this.distributedCache.has(key);
            if (exists) {
                const value = await this.distributedCache.get(key);
                if (value !== null) {
                    await this.localCache.set(key, value, this.config.localTtl);
                }
                return true;
            }
        }
        return false;
    }
    close() {
        this.localCache.close();
    }
}
exports.MultiLevelCacheService = MultiLevelCacheService;
//# sourceMappingURL=multi-level-cache-service.js.map