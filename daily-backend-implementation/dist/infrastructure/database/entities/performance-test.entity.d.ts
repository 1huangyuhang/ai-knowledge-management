import { TestResultEntity } from './test-result.entity';
export declare class PerformanceTestEntity {
    id: string;
    name: string;
    description: string;
    test_type: string;
    scenario_id: string;
    status: string;
    created_at: Date;
    executed_at: Date;
    completed_at: Date;
    results: TestResultEntity[];
}
export declare class TestScenarioEntity {
    id: string;
    name: string;
    description: string;
    endpoints_json: any[];
    config_json: any;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=performance-test.entity.d.ts.map