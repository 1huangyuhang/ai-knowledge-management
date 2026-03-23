import { OptimizationType, OptimizationConfig, PerformanceBaseline, OptimizationResult, OptimizationStatus, OptimizationMetric } from '../../domain/entities/PerformanceOptimization';
import { PerformanceOptimizationService } from '../../domain/services/PerformanceOptimizationService';
import { PerformanceOptimizationRepository } from '../../domain/repositories/PerformanceOptimizationRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
export declare class PerformanceOptimizationServiceImpl implements PerformanceOptimizationService {
    private readonly performanceRepository;
    private readonly logger;
    constructor(performanceRepository: PerformanceOptimizationRepository, logger: LoggerService);
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
    private collectSystemMetrics;
    private getCPUUsage;
    private getMemoryUsage;
    private getDiskUsage;
    private getNetworkLatency;
    private getAPIResponseTime;
    private generateId;
    private calculateImprovement;
    private getDefaultOptimizationSuggestions;
    private generateOptimizationSuggestions;
    private optimizeCache;
    private optimizeDatabase;
    private optimizeAPI;
    private optimizeMemory;
    private optimizeCPU;
    private optimizeNetwork;
    private optimizeCode;
    private generateOptimizedMetrics;
    private validateCacheConfig;
    private validateDatabaseConfig;
    private validateAPIConfig;
}
//# sourceMappingURL=PerformanceOptimizationServiceImpl.d.ts.map