import { PerformanceBaseline, OptimizationResult, OptimizationType } from '../entities/PerformanceOptimization';
export interface PerformanceOptimizationRepository {
    savePerformanceBaseline(baseline: PerformanceBaseline): Promise<PerformanceBaseline>;
    getPerformanceBaseline(id: string): Promise<PerformanceBaseline | null>;
    getAllPerformanceBaselines(limit: number, offset: number): Promise<PerformanceBaseline[]>;
    getLatestPerformanceBaseline(): Promise<PerformanceBaseline | null>;
    saveOptimizationResult(result: OptimizationResult): Promise<OptimizationResult>;
    getOptimizationResult(id: string): Promise<OptimizationResult | null>;
    getAllOptimizationResults(limit: number, offset: number): Promise<OptimizationResult[]>;
    getOptimizationResultsByType(type: OptimizationType, limit: number, offset: number): Promise<OptimizationResult[]>;
    updateOptimizationStatus(id: string, status: string): Promise<OptimizationResult | null>;
    deleteOptimizationResult(id: string): Promise<boolean>;
    deletePerformanceBaseline(id: string): Promise<boolean>;
    cleanupOldData(days: number): Promise<number>;
}
//# sourceMappingURL=PerformanceOptimizationRepository.d.ts.map