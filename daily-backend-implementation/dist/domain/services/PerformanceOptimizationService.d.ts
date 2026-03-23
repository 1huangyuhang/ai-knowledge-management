import { OptimizationType, OptimizationConfig, PerformanceBaseline, OptimizationResult, OptimizationStatus, OptimizationMetric } from '../entities/PerformanceOptimization';
export interface PerformanceOptimizationService {
    createPerformanceBaseline(): Promise<PerformanceBaseline>;
    getCurrentPerformanceBaseline(): Promise<PerformanceBaseline | null>;
    getPerformanceBaselineHistory(limit: number, offset: number): Promise<PerformanceBaseline[]>;
    executeOptimization(type: OptimizationType, config: OptimizationConfig): Promise<OptimizationResult>;
    executeBulkOptimization(optimizations: Array<{
        type: OptimizationType;
        config: OptimizationConfig;
    }>): Promise<OptimizationResult[]>;
    getOptimizationResult(id: string): Promise<OptimizationResult | null>;
    getOptimizationResultHistory(limit: number, offset: number): Promise<OptimizationResult[]>;
    getOptimizationResultsByType(type: OptimizationType, limit: number, offset: number): Promise<OptimizationResult[]>;
    updateOptimizationConfig(id: string, config: OptimizationConfig): Promise<OptimizationResult | null>;
    getOptimizationStatus(id: string): Promise<OptimizationStatus | null>;
    cancelOptimization(id: string): Promise<boolean>;
    getSystemMetrics(): Promise<OptimizationMetric[]>;
    getOptimizationSuggestions(): Promise<Array<{
        type: OptimizationType;
        recommendation: string;
        priority: number;
    }>>;
    validateOptimizationConfig(type: OptimizationType, config: OptimizationConfig): Promise<boolean>;
    resetOptimization(id: string): Promise<boolean>;
    resetBulkOptimization(ids: string[]): Promise<Record<string, boolean>>;
}
//# sourceMappingURL=PerformanceOptimizationService.d.ts.map