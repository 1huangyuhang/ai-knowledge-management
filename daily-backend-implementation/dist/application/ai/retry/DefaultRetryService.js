"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRetryService = void 0;
class DefaultRetryService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async executeWithRetry(operation, strategy) {
        let attempt = 0;
        while (true) {
            attempt++;
            try {
                this.logger.debug(`Executing operation, attempt ${attempt}`);
                const result = await operation();
                this.logger.debug(`Operation succeeded on attempt ${attempt}`);
                return result;
            }
            catch (error) {
                this.logger.debug(`Operation failed on attempt ${attempt}`, { error: error instanceof Error ? error.message : 'Unknown error' });
                if (!strategy.shouldRetry(attempt, error)) {
                    this.logger.debug(`Retries exhausted, giving up after ${attempt} attempts`);
                    throw error;
                }
                const waitTime = strategy.getWaitTime(attempt);
                this.logger.debug(`Waiting ${waitTime}ms before next retry`);
                await this.wait(waitTime);
            }
        }
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.DefaultRetryService = DefaultRetryService;
//# sourceMappingURL=DefaultRetryService.js.map