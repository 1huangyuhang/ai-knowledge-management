import { UUID } from '../value-objects/uuid';
import { PerformanceTest, TestScenario, TestResult, PerformanceReport, TestType } from '../entities/PerformanceTest';
export interface PerformanceTestService {
    createTest(name: string, description: string, testType: TestType, scenarioId: UUID): Promise<PerformanceTest>;
    runTest(testId: UUID): Promise<PerformanceTest>;
    getTestResults(testId: UUID): Promise<TestResult[]>;
    getTestDetails(testId: UUID): Promise<PerformanceTest>;
    getAllTests(): Promise<PerformanceTest[]>;
    getPerformanceReport(testId: UUID): Promise<PerformanceReport>;
}
export interface TestScenarioService {
    createScenario(name: string, description: string, endpoints: any[], config: any): Promise<TestScenario>;
    updateScenario(id: UUID, name?: string, description?: string, endpoints?: any[], config?: any): Promise<TestScenario>;
    getScenarioDetails(id: UUID): Promise<TestScenario>;
    getAllScenarios(): Promise<TestScenario[]>;
}
export interface TestAnalyzerService {
    analyzeTestResult(testResult: TestResult): Promise<any>;
    identifyBottlenecks(metrics: any[]): Promise<string[]>;
    generateRecommendations(analysis: any): Promise<string[]>;
    calculatePerformanceScore(metrics: any[]): Promise<number>;
}
export interface ReportGeneratorService {
    generateReport(test: PerformanceTest, results: TestResult[], analysis: any, recommendations: string[]): Promise<PerformanceReport>;
    generateHtmlReport(report: PerformanceReport): Promise<string>;
    generateJsonReport(report: PerformanceReport): Promise<string>;
}
//# sourceMappingURL=PerformanceTestService.d.ts.map