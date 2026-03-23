import { PerformanceTestEntity } from './performance-test.entity';
export declare class TestResultEntity {
    id: string;
    test_id: string;
    summary_json: any;
    created_at: Date;
    performance_test: PerformanceTestEntity;
    metrics: TestMetricEntity[];
}
export declare class TestMetricEntity {
    id: string;
    result_id: string;
    name: string;
    value: string;
    unit: string;
    timestamp: Date;
    endpoint: string;
    test_result: TestResultEntity;
}
//# sourceMappingURL=test-result.entity.d.ts.map