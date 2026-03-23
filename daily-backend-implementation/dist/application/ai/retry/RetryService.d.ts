export interface RetryService {
    executeWithRetry<T>(operation: () => Promise<T>, strategy: any): Promise<T>;
}
//# sourceMappingURL=RetryService.d.ts.map