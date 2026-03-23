"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExponentialBackoffRetryStrategy_1 = require("../../../application/ai/retry/ExponentialBackoffRetryStrategy");
const ApiCallError_1 = require("../../../infrastructure/ai/api/ApiCallError");
describe('ExponentialBackoffRetryStrategy', () => {
    const config = {
        maxRetries: 3,
        initialInterval: 1000,
        backoffFactor: 2,
        maxWaitTime: 30000
    };
    let strategy;
    beforeEach(() => {
        strategy = new ExponentialBackoffRetryStrategy_1.ExponentialBackoffRetryStrategy(config);
    });
    describe('getWaitTime', () => {
        it('should return initial interval for first attempt', () => {
            expect(strategy.getWaitTime(1)).toBe(1000);
        });
        it('should return exponential backoff time for subsequent attempts', () => {
            expect(strategy.getWaitTime(2)).toBe(2000);
            expect(strategy.getWaitTime(3)).toBe(4000);
            expect(strategy.getWaitTime(4)).toBe(8000);
        });
    });
    describe('shouldRetry', () => {
        it('should return true for retryable errors within max retries', () => {
            expect(strategy.shouldRetry(1, new ApiCallError_1.ApiTimeoutError())).toBe(true);
            expect(strategy.shouldRetry(2, new ApiCallError_1.ApiServiceUnavailableError())).toBe(true);
            expect(strategy.shouldRetry(3, new ApiCallError_1.ApiTimeoutError())).toBe(true);
        });
        it('should return false when max retries exceeded', () => {
            expect(strategy.shouldRetry(4, new ApiCallError_1.ApiTimeoutError())).toBe(false);
        });
    });
});
//# sourceMappingURL=ExponentialBackoffRetryStrategy.test.js.map