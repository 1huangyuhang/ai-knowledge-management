"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultRetryService_1 = require("../../../application/ai/retry/DefaultRetryService");
const ExponentialBackoffRetryStrategy_1 = require("../../../application/ai/retry/ExponentialBackoffRetryStrategy");
class MockLogger {
    debug(message, metadata) {
        console.log(`DEBUG: ${message}`, metadata);
    }
    info(message, metadata) {
        console.log(`INFO: ${message}`, metadata);
    }
    warn(message, metadata) {
        console.log(`WARN: ${message}`, metadata);
    }
    error(message, error, metadata) {
        console.log(`ERROR: ${message}`, error, metadata);
    }
    fatal(message, error, metadata) {
        console.log(`FATAL: ${message}`, error, metadata);
    }
}
describe('DefaultRetryService', () => {
    let retryService;
    let logger;
    beforeEach(() => {
        logger = new MockLogger();
        retryService = new DefaultRetryService_1.DefaultRetryService(logger);
    });
    it('should succeed on first attempt', async () => {
        const mockOperation = jest.fn().mockResolvedValue('success');
        const strategy = new ExponentialBackoffRetryStrategy_1.ExponentialBackoffRetryStrategy({
            maxRetries: 3,
            initialInterval: 100,
            backoffFactor: 2,
            maxWaitTime: 1000
        });
        const result = await retryService.executeWithRetry(mockOperation, strategy);
        expect(result).toBe('success');
        expect(mockOperation).toHaveBeenCalledTimes(1);
    });
    it('should retry on failure and succeed', async () => {
        const mockOperation = jest.fn()
            .mockRejectedValueOnce(new Error('First failure'))
            .mockRejectedValueOnce(new Error('Second failure'))
            .mockResolvedValue('success');
        const strategy = new ExponentialBackoffRetryStrategy_1.ExponentialBackoffRetryStrategy({
            maxRetries: 3,
            initialInterval: 100,
            backoffFactor: 2,
            maxWaitTime: 1000
        });
        const result = await retryService.executeWithRetry(mockOperation, strategy);
        expect(result).toBe('success');
        expect(mockOperation).toHaveBeenCalledTimes(3);
    });
    it('should fail after max retries', async () => {
        const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
        const strategy = new ExponentialBackoffRetryStrategy_1.ExponentialBackoffRetryStrategy({
            maxRetries: 3,
            initialInterval: 100,
            backoffFactor: 2,
            maxWaitTime: 1000
        });
        await expect(retryService.executeWithRetry(mockOperation, strategy))
            .rejects.toThrow('Persistent failure');
        expect(mockOperation).toHaveBeenCalledTimes(4);
    });
});
//# sourceMappingURL=DefaultRetryService.test.js.map