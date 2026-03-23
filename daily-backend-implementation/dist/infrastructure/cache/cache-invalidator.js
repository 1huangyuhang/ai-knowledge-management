"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidator = void 0;
class CacheInvalidator {
    cacheService;
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async invalidate(key) {
        await this.cacheService.delete(key);
    }
    async invalidateBatch(keys) {
        await Promise.all(keys.map(key => this.cacheService.delete(key)));
    }
    async invalidatePattern(pattern, keys) {
        if (keys) {
            const matchingKeys = keys.filter(key => this.matchesPattern(key, pattern));
            await this.invalidateBatch(matchingKeys);
        }
        else {
            throw new Error('Pattern matching not supported without explicit keys');
        }
    }
    scheduleInvalidation(key, delay) {
        return setTimeout(async () => {
            await this.invalidate(key);
        }, delay);
    }
    cancelInvalidation(timeoutId) {
        clearTimeout(timeoutId);
    }
    matchesPattern(key, pattern) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
    }
}
exports.CacheInvalidator = CacheInvalidator;
//# sourceMappingURL=cache-invalidator.js.map