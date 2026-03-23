import { UUID } from '../value-objects/uuid';
export declare enum TestType {
    LOAD_TEST = "LOAD_TEST",
    STRESS_TEST = "STRESS_TEST",
    SPIKE_TEST = "SPIKE_TEST",
    ENDURANCE_TEST = "ENDURANCE_TEST",
    CONFIG_TEST = "CONFIG_TEST",
    ISOLATION_TEST = "ISOLATION_TEST"
}
export declare enum TestStatus {
    CREATED = "CREATED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export interface TestEndpoint {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    weight?: number;
}
export interface ScenarioConfig {
    concurrentUsers: number;
    rampUpTime: number;
    duration: number;
    delay?: number;
    timeout?: number;
    thinkTime?: number;
}
export interface TestMetric {
    name: string;
    value: number | string;
    unit: string;
    timestamp: Date;
    endpoint?: string;
}
export interface TestSummary {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage?: number;
    memoryUsage?: number;
}
export interface TestAnalysis {
    performanceScore: number;
    bottlenecks: string[];
    trends: Record<string, any>;
    recommendations: string[];
}
export declare class PerformanceTest {
    readonly id: UUID;
    readonly name: string;
    readonly description: string;
    readonly testType: TestType;
    readonly scenarioId: UUID;
    readonly createdAt: Date;
    executedAt?: Date | undefined;
    completedAt?: Date | undefined;
    status: TestStatus;
    private constructor();
    static create(name: string, description: string, testType: TestType, scenarioId: UUID): PerformanceTest;
    startExecution(): void;
    completeExecution(): void;
    failExecution(): void;
}
export declare class TestScenario {
    readonly id: UUID;
    name: string;
    description: string;
    endpoints: TestEndpoint[];
    config: ScenarioConfig;
    createdAt: Date;
    updatedAt: Date;
    private constructor();
    static create(name: string, description: string, endpoints: TestEndpoint[], config: ScenarioConfig): TestScenario;
    update(name?: string, description?: string, endpoints?: TestEndpoint[], config?: ScenarioConfig): void;
}
export declare class TestResult {
    readonly id: UUID;
    readonly testId: UUID;
    readonly metrics: TestMetric[];
    readonly summary: TestSummary;
    readonly createdAt: Date;
    private constructor();
    static create(testId: UUID, metrics: TestMetric[], summary: TestSummary): TestResult;
}
export declare class PerformanceReport {
    readonly id: UUID;
    readonly testId: UUID;
    readonly testName: string;
    readonly testType: TestType;
    readonly executedAt: Date;
    readonly summary: TestSummary;
    readonly metrics: TestMetric[];
    readonly analysis: TestAnalysis;
    readonly recommendations: string[];
    readonly createdAt: Date;
    private constructor();
    static create(testId: UUID, testName: string, testType: TestType, executedAt: Date, summary: TestSummary, metrics: TestMetric[], analysis: TestAnalysis, recommendations: string[]): PerformanceReport;
}
//# sourceMappingURL=PerformanceTest.d.ts.map