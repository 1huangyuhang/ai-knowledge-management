export interface RetryStrategy {
    getWaitTime(attempt: number): number;
    shouldRetry(attempt: number, error: any): boolean;
}
//# sourceMappingURL=RetryStrategy.d.ts.map