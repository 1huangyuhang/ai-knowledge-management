export declare enum OptimizationType {
    CACHE = "CACHE",
    DATABASE = "DATABASE",
    API = "API",
    MEMORY = "MEMORY",
    CPU = "CPU",
    NETWORK = "NETWORK",
    CODE = "CODE"
}
export declare enum OptimizationStatus {
    NOT_OPTIMIZED = "NOT_OPTIMIZED",
    OPTIMIZING = "OPTIMIZING",
    OPTIMIZED = "OPTIMIZED",
    FAILED = "FAILED"
}
export interface OptimizationConfig {
    type: OptimizationType;
    parameters: Record<string, any>;
    enabled: boolean;
    priority: number;
}
export interface OptimizationMetric {
    name: string;
    value: number;
    unit: string;
    description: string;
    timestamp: Date;
}
export interface PerformanceBaseline {
    id: string;
    createdAt: Date;
    metrics: OptimizationMetric[];
}
export interface OptimizationResult {
    id: string;
    type: OptimizationType;
    config: OptimizationConfig;
    baseline: PerformanceBaseline;
    optimizedMetrics: OptimizationMetric[];
    status: OptimizationStatus;
    startTime: Date;
    endTime?: Date;
    improvementPercentage?: number;
    logs: string[];
}
export declare class PerformanceOptimization {
    private readonly _id;
    private _type;
    private _config;
    private _status;
    private _result?;
    private readonly _createdAt;
    private _updatedAt;
    constructor(id: string, type: OptimizationType, config: OptimizationConfig);
    startOptimization(): this;
    completeOptimization(result: OptimizationResult): this;
    failOptimization(error: string): this;
    updateConfig(config: Partial<OptimizationConfig>): this;
    get id(): string;
    get type(): OptimizationType;
    get config(): OptimizationConfig;
    get status(): OptimizationStatus;
    get result(): OptimizationResult | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
}
//# sourceMappingURL=PerformanceOptimization.d.ts.map