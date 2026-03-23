"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheService = void 0;
class MemoryCacheService {
    cache = new Map();
    cleanupInterval = 5 * 60 * 1000;
    cleanupTimer = null;
    defaultTTL = 5 * 60 * 1000;
    constructor(cleanupInterval) {
        if (cleanupInterval) {
            this.cleanupInterval = cleanupInterval;
        }
        this.startCleanupTimer();
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredItems();
        }, this.cleanupInterval);
    }
    cleanupExpiredItems() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt < now) {
                this.cache.delete(key);
            }
        }
    }
    async set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            value,
            expiresAt
        });
    }
    async get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        if (item.expiresAt < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
    }
    async has(key) {
        const item = this.cache.get(key);
        if (!item) {
            return false;
        }
        if (item.expiresAt < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    close() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
    }
}
exports.MemoryCacheService = MemoryCacheService;
//# sourceMappingURL=memory-cache-service.js.map