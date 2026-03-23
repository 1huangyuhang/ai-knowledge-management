import { UUID } from '../../domain/value-objects/uuid';
import { PerformanceTestService, TestScenarioService, TestAnalyzerService, ReportGeneratorService } from '../../domain/services/PerformanceTestService';
import { PerformanceTestRepository, TestScenarioRepository, TestResultRepository, PerformanceReportRepository } from '../../domain/repositories/PerformanceTestRepository';
import { PerformanceTest, TestScenario, TestResult, PerformanceReport, TestType } from '../../domain/entities/PerformanceTest';
export declare class PerformanceTestServiceImpl implements PerformanceTestService {
    private readonly performanceTestRepository;
    private readonly testScenarioRepository;
    private readonly testResultRepository;
    private readonly performanceReportRepository;
    private readonly testAnalyzerService;
    private readonly reportGeneratorService;
    constructor(performanceTestRepository: PerformanceTestRepository, testScenarioRepository: TestScenarioRepository, testResultRepository: TestResultRepository, performanceReportRepository: PerformanceReportRepository, testAnalyzerService: TestAnalyzerService, reportGeneratorService: ReportGeneratorService);
    createTest(name: string, description: string, testType: TestType, scenarioId: UUID): Promise<PerformanceTest>;
    runTest(testId: UUID): Promise<PerformanceTest>;
    getTestResults(testId: UUID): Promise<TestResult[]>;
    getTestDetails(testId: UUID): Promise<PerformanceTest>;
    getAllTests(): Promise<PerformanceTest[]>;
    getPerformanceReport(testId: UUID): Promise<PerformanceReport>;
    private generateMockMetrics;
    private generateMockSummary;
}
export declare class TestScenarioServiceImpl implements TestScenarioService {
    private readonly testScenarioRepository;
    constructor(testScenarioRepository: TestScenarioRepository);
    createScenario(name: string, description: string, endpoints: any[], config: any): Promise<TestScenario>;
    updateScenario(id: UUID, name?: string, description?: string, endpoints?: any[], config?: any): Promise<TestScenario>;
    getScenarioDetails(id: UUID): Promise<TestScenario>;
    getAllScenarios(): Promise<TestScenario[]>;
}
export declare class TestAnalyzerServiceImpl implements TestAnalyzerService {
    analyzeTestResult(testResult: TestResult): Promise<any>;
    identifyBottlenecks(metrics: any[]): Promise<string[]>;
    generateRecommendations(analysis: any): Promise<string[]>;
    calculatePerformanceScore(metrics: any[]): Promise<number>;
    private identifyTrends;
}
export declare class ReportGeneratorServiceImpl implements ReportGeneratorService {
    generateReport(test: PerformanceTest, results: TestResult[], analysis: any, recommendations: string[]): Promise<PerformanceReport>;
    generateHtmlReport(report: PerformanceReport): Promise<string>;
    generateJsonReport(report: PerformanceReport): Promise<string>;
    private saveReport;
}
//# sourceMappingURL=PerformanceTestServiceImpl.d.ts.map