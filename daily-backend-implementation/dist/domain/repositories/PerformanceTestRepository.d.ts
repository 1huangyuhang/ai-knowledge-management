import { UUID } from '../value-objects/uuid';
import { PerformanceTest, TestScenario, TestResult, PerformanceReport } from '../entities/PerformanceTest';
export interface PerformanceTestRepository {
    create(test: PerformanceTest): Promise<void>;
    update(test: PerformanceTest): Promise<void>;
    findById(id: UUID): Promise<PerformanceTest | null>;
    findAll(): Promise<PerformanceTest[]>;
    findByStatus(status: string): Promise<PerformanceTest[]>;
    delete(id: UUID): Promise<void>;
}
export interface TestScenarioRepository {
    create(scenario: TestScenario): Promise<void>;
    update(scenario: TestScenario): Promise<void>;
    findById(id: UUID): Promise<TestScenario | null>;
    findAll(): Promise<TestScenario[]>;
    delete(id: UUID): Promise<void>;
}
export interface TestResultRepository {
    create(result: TestResult): Promise<void>;
    findByTestId(testId: UUID): Promise<TestResult[]>;
    findById(id: UUID): Promise<TestResult | null>;
    delete(id: UUID): Promise<void>;
}
export interface PerformanceReportRepository {
    create(report: PerformanceReport): Promise<void>;
    findByTestId(testId: UUID): Promise<PerformanceReport | null>;
    findById(id: UUID): Promise<PerformanceReport | null>;
    findAll(): Promise<PerformanceReport[]>;
    delete(id: UUID): Promise<void>;
}
//# sourceMappingURL=PerformanceTestRepository.d.ts.map