import { DataSource } from 'typeorm';
import { UUID } from '../../../domain/value-objects/uuid';
import { PerformanceTestRepository, TestScenarioRepository, TestResultRepository, PerformanceReportRepository } from '../../../domain/repositories/PerformanceTestRepository';
import { PerformanceTest, TestScenario, TestResult, PerformanceReport } from '../../../domain/entities/PerformanceTest';
export declare class PerformanceTestRepositoryImpl implements PerformanceTestRepository {
    private readonly dataSource;
    private performanceTestRepository;
    private testResultRepository;
    private testScenarioRepository;
    private performanceReportRepository;
    constructor(dataSource: DataSource);
    create(test: PerformanceTest): Promise<void>;
    update(test: PerformanceTest): Promise<void>;
    findById(id: UUID): Promise<PerformanceTest | null>;
    findAll(): Promise<PerformanceTest[]>;
    findByStatus(status: string): Promise<PerformanceTest[]>;
    delete(id: UUID): Promise<void>;
    private mapToPerformanceTest;
}
export declare class TestScenarioRepositoryImpl implements TestScenarioRepository {
    private readonly dataSource;
    private testScenarioRepository;
    constructor(dataSource: DataSource);
    create(scenario: TestScenario): Promise<void>;
    update(scenario: TestScenario): Promise<void>;
    findById(id: UUID): Promise<TestScenario | null>;
    findAll(): Promise<TestScenario[]>;
    delete(id: UUID): Promise<void>;
    private mapToTestScenario;
}
export declare class TestResultRepositoryImpl implements TestResultRepository {
    private readonly dataSource;
    private testResultRepository;
    constructor(dataSource: DataSource);
    create(result: TestResult): Promise<void>;
    findByTestId(testId: UUID): Promise<TestResult[]>;
    findById(id: UUID): Promise<TestResult | null>;
    delete(id: UUID): Promise<void>;
    private mapToTestResult;
}
export declare class PerformanceReportRepositoryImpl implements PerformanceReportRepository {
    private readonly dataSource;
    private performanceReportRepository;
    constructor(dataSource: DataSource);
    create(report: PerformanceReport): Promise<void>;
    findByTestId(testId: UUID): Promise<PerformanceReport | null>;
    findById(id: UUID): Promise<PerformanceReport | null>;
    findAll(): Promise<PerformanceReport[]>;
    delete(id: UUID): Promise<void>;
    private mapToPerformanceReport;
}
//# sourceMappingURL=PerformanceTestRepositoryImpl.d.ts.map