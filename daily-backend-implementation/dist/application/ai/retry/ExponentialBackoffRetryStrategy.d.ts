import { RetryStrategy } from './RetryStrategy';
export interface ExponentialBackoffConfig {
    maxRetries: number;
    initialInterval: number;
    backoffFactor: number;
    maxWaitTime: number;
    retryAllErrors?: boolean;
}
export declare class ExponentialBackoffRetryStrategy implements RetryStrategy {
    private config;
    private readonly retryAllErrors;
    constructor(config: ExponentialBackoffConfig);
    getWaitTime(attempt: number): number;
    shouldRetry(attempt: number, error: any): boolean;
    private isRetryableError;
}
//# sourceMappingURL=ExponentialBackoffRetryStrategy.d.ts.map