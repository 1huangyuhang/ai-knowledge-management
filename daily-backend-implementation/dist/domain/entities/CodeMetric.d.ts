export interface MetricThreshold {
    min?: number;
    max?: number;
    optimal: number;
    unit: string;
}
export declare class CodeMetric {
    private readonly name;
    private readonly value;
    private readonly unit;
    private readonly description;
    private readonly threshold;
    constructor(name: string, value: number | string, unit: string, description: string, threshold: MetricThreshold);
    getName(): string;
    getValue(): number | string;
    getUnit(): string;
    getDescription(): string;
    getThreshold(): MetricThreshold;
    isWithinThreshold(): boolean;
}
//# sourceMappingURL=CodeMetric.d.ts.map