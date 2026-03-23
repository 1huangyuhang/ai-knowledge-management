"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReportRepositoryImpl = exports.TestResultRepositoryImpl = exports.TestScenarioRepositoryImpl = exports.PerformanceTestRepositoryImpl = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const PerformanceTest_1 = require("../../../domain/entities/PerformanceTest");
const performance_test_entity_1 = require("../entities/performance-test.entity");
const test_result_entity_1 = require("../entities/test-result.entity");
const performance_report_entity_1 = require("../entities/performance-report.entity");
class PerformanceTestRepositoryImpl {
    dataSource;
    performanceTestRepository;
    testResultRepository;
    testScenarioRepository;
    performanceReportRepository;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.performanceTestRepository = dataSource.getRepository(performance_test_entity_1.PerformanceTestEntity);
        this.testResultRepository = dataSource.getRepository(test_result_entity_1.TestResultEntity);
        this.testScenarioRepository = dataSource.getRepository(performance_test_entity_1.TestScenarioEntity);
        this.performanceReportRepository = dataSource.getRepository(performance_report_entity_1.PerformanceReportEntity);
    }
    async create(test) {
        const performanceTestEntity = this.performanceTestRepository.create({
            id: test.id.value,
            name: test.name,
            description: test.description,
            test_type: test.testType,
            scenario_id: test.scenarioId.value,
            status: test.status,
            created_at: test.createdAt,
            executed_at: test.executedAt,
            completed_at: test.completedAt
        });
        await this.performanceTestRepository.save(performanceTestEntity);
    }
    async update(test) {
        const performanceTestEntity = await this.performanceTestRepository.findOneBy({ id: test.id.value });
        if (!performanceTestEntity) {
            throw new Error(`Performance test with ID ${test.id.value} not found`);
        }
        performanceTestEntity.name = test.name;
        performanceTestEntity.description = test.description;
        performanceTestEntity.test_type = test.testType;
        performanceTestEntity.scenario_id = test.scenarioId.value;
        performanceTestEntity.status = test.status;
        performanceTestEntity.executed_at = test.executedAt;
        performanceTestEntity.completed_at = test.completedAt;
        await this.performanceTestRepository.save(performanceTestEntity);
    }
    async findById(id) {
        const performanceTestEntity = await this.performanceTestRepository.findOneBy({ id: id.value });
        if (!performanceTestEntity) {
            return null;
        }
        return this.mapToPerformanceTest(performanceTestEntity);
    }
    async findAll() {
        const performanceTestEntities = await this.performanceTestRepository.find({
            order: { created_at: 'DESC' }
        });
        return performanceTestEntities.map(entity => this.mapToPerformanceTest(entity));
    }
    async findByStatus(status) {
        const performanceTestEntities = await this.performanceTestRepository.find({
            where: { status },
            order: { created_at: 'DESC' }
        });
        return performanceTestEntities.map(entity => this.mapToPerformanceTest(entity));
    }
    async delete(id) {
        await this.performanceTestRepository.delete({ id: id.value });
    }
    mapToPerformanceTest(entity) {
        return new PerformanceTest_1.PerformanceTest(uuid_1.UUID.fromString(entity.id), entity.name, entity.description, entity.test_type, uuid_1.UUID.fromString(entity.scenario_id), entity.created_at, entity.executed_at, entity.completed_at, entity.status);
    }
}
exports.PerformanceTestRepositoryImpl = PerformanceTestRepositoryImpl;
class TestScenarioRepositoryImpl {
    dataSource;
    testScenarioRepository;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.testScenarioRepository = dataSource.getRepository(performance_test_entity_1.TestScenarioEntity);
    }
    async create(scenario) {
        const testScenarioEntity = this.testScenarioRepository.create({
            id: scenario.id.value,
            name: scenario.name,
            description: scenario.description,
            endpoints_json: scenario.endpoints,
            config_json: scenario.config,
            created_at: scenario.createdAt,
            updated_at: scenario.updatedAt
        });
        await this.testScenarioRepository.save(testScenarioEntity);
    }
    async update(scenario) {
        const testScenarioEntity = await this.testScenarioRepository.findOneBy({ id: scenario.id.value });
        if (!testScenarioEntity) {
            throw new Error(`Test scenario with ID ${scenario.id.value} not found`);
        }
        testScenarioEntity.name = scenario.name;
        testScenarioEntity.description = scenario.description;
        testScenarioEntity.endpoints_json = scenario.endpoints;
        testScenarioEntity.config_json = scenario.config;
        testScenarioEntity.updated_at = scenario.updatedAt;
        await this.testScenarioRepository.save(testScenarioEntity);
    }
    async findById(id) {
        const testScenarioEntity = await this.testScenarioRepository.findOneBy({ id: id.value });
        if (!testScenarioEntity) {
            return null;
        }
        return this.mapToTestScenario(testScenarioEntity);
    }
    async findAll() {
        const testScenarioEntities = await this.testScenarioRepository.find({
            order: { updated_at: 'DESC' }
        });
        return testScenarioEntities.map(entity => this.mapToTestScenario(entity));
    }
    async delete(id) {
        await this.testScenarioRepository.delete({ id: id.value });
    }
    mapToTestScenario(entity) {
        return new PerformanceTest_1.TestScenario(uuid_1.UUID.fromString(entity.id), entity.name, entity.description, entity.endpoints_json, entity.config_json, entity.created_at, entity.updated_at);
    }
}
exports.TestScenarioRepositoryImpl = TestScenarioRepositoryImpl;
class TestResultRepositoryImpl {
    dataSource;
    testResultRepository;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.testResultRepository = dataSource.getRepository(test_result_entity_1.TestResultEntity);
    }
    async create(result) {
        const testResultEntity = this.testResultRepository.create({
            id: result.id.value,
            test_id: result.testId.value,
            summary_json: result.summary,
            created_at: result.createdAt
        });
        await this.testResultRepository.save(testResultEntity);
    }
    async findByTestId(testId) {
        const testResultEntities = await this.testResultRepository.find({
            where: { test_id: testId.value },
            order: { created_at: 'DESC' }
        });
        return testResultEntities.map(entity => this.mapToTestResult(entity));
    }
    async findById(id) {
        const testResultEntity = await this.testResultRepository.findOneBy({ id: id.value });
        if (!testResultEntity) {
            return null;
        }
        return this.mapToTestResult(testResultEntity);
    }
    async delete(id) {
        await this.testResultRepository.delete({ id: id.value });
    }
    mapToTestResult(entity) {
        return new PerformanceTest_1.TestResult(uuid_1.UUID.fromString(entity.id), uuid_1.UUID.fromString(entity.test_id), [], entity.summary_json, entity.created_at);
    }
}
exports.TestResultRepositoryImpl = TestResultRepositoryImpl;
class PerformanceReportRepositoryImpl {
    dataSource;
    performanceReportRepository;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.performanceReportRepository = dataSource.getRepository(performance_report_entity_1.PerformanceReportEntity);
    }
    async create(report) {
        const performanceReportEntity = this.performanceReportRepository.create({
            id: report.id.value,
            test_id: report.testId.value,
            test_name: report.testName,
            test_type: report.testType,
            executed_at: report.executedAt,
            summary_json: report.summary,
            analysis_json: report.analysis,
            recommendations: report.recommendations,
            created_at: report.createdAt
        });
        await this.performanceReportRepository.save(performanceReportEntity);
    }
    async findByTestId(testId) {
        const performanceReportEntity = await this.performanceReportRepository.findOneBy({ test_id: testId.value });
        if (!performanceReportEntity) {
            return null;
        }
        return this.mapToPerformanceReport(performanceReportEntity);
    }
    async findById(id) {
        const performanceReportEntity = await this.performanceReportRepository.findOneBy({ id: id.value });
        if (!performanceReportEntity) {
            return null;
        }
        return this.mapToPerformanceReport(performanceReportEntity);
    }
    async findAll() {
        const performanceReportEntities = await this.performanceReportRepository.find({
            order: { created_at: 'DESC' }
        });
        return performanceReportEntities.map(entity => this.mapToPerformanceReport(entity));
    }
    async delete(id) {
        await this.performanceReportRepository.delete({ id: id.value });
    }
    mapToPerformanceReport(entity) {
        return new PerformanceTest_1.PerformanceReport(uuid_1.UUID.fromString(entity.id), uuid_1.UUID.fromString(entity.test_id), entity.test_name, entity.test_type, entity.executed_at, entity.summary_json, [], entity.analysis_json, entity.recommendations, entity.created_at);
    }
}
exports.PerformanceReportRepositoryImpl = PerformanceReportRepositoryImpl;
//# sourceMappingURL=PerformanceTestRepositoryImpl.js.map