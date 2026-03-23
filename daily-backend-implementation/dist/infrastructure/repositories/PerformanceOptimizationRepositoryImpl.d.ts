import { PerformanceBaseline, OptimizationResult, OptimizationType } from '../../domain/entities/PerformanceOptimization';
import { PerformanceOptimizationRepository } from '../../domain/repositories/PerformanceOptimizationRepository';
import { LoggerService } from '../logging/LoggerService';
export declare class PerformanceOptimizationRepositoryImpl implements PerformanceOptimizationRepository {
    private readonly logger;
    private readonly performanceBaselines;
    private readonly optimizationResults;
    constructor(logger: LoggerService);
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
//# sourceMappingURL=PerformanceOptimizationRepositoryImpl.d.ts.map