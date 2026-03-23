import { PerformanceTest } from '../../domain/entities/PerformanceTest';
import { PerformanceTestRepository } from '../../domain/repositories/PerformanceTestRepository';
import { PerformanceTestType } from '../../domain/enums/PerformanceTestType';
import { PerformanceTestStatus } from '../../domain/enums/PerformanceTestStatus';
import { Result } from '../../domain/core/Result';
import { LoggerService } from '../services/LoggerService';
export interface PerformanceTestServiceProps {
    performanceTestRepository: PerformanceTestRepository;
    loggerService: LoggerService;
}
export declare class PerformanceTestService {
    private performanceTestRepository;
    private loggerService;
    constructor(props: PerformanceTestServiceProps);
    createPerformanceTest(testData: {
        name: string;
        description: string;
        testType: PerformanceTestType;
        testData?: any;
        scheduledAt?: Date;
    }): Promise<Result<PerformanceTest>>;
    runPerformanceTest(testId: string): Promise<Result<PerformanceTest>>;
    private executeTest;
    getPerformanceTests(filters?: {
        testType?: PerformanceTestType;
        status?: PerformanceTestStatus;
        limit?: number;
        offset?: number;
    }): Promise<Result<PerformanceTest[]>>;
    getPerformanceTestById(testId: string): Promise<Result<PerformanceTest>>;
    deletePerformanceTest(testId: string): Promise<Result<boolean>>;
}
//# sourceMappingURL=PerformanceTestService.d.ts.map