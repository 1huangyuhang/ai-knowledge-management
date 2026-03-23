"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReport = exports.TestResult = exports.TestScenario = exports.PerformanceTest = exports.TestStatus = exports.TestType = void 0;
const uuid_1 = require("../value-objects/uuid");
var TestType;
(function (TestType) {
    TestType["LOAD_TEST"] = "LOAD_TEST";
    TestType["STRESS_TEST"] = "STRESS_TEST";
    TestType["SPIKE_TEST"] = "SPIKE_TEST";
    TestType["ENDURANCE_TEST"] = "ENDURANCE_TEST";
    TestType["CONFIG_TEST"] = "CONFIG_TEST";
    TestType["ISOLATION_TEST"] = "ISOLATION_TEST";
})(TestType || (exports.TestType = TestType = {}));
var TestStatus;
(function (TestStatus) {
    TestStatus["CREATED"] = "CREATED";
    TestStatus["RUNNING"] = "RUNNING";
    TestStatus["COMPLETED"] = "COMPLETED";
    TestStatus["FAILED"] = "FAILED";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
class PerformanceTest {
    id;
    name;
    description;
    testType;
    scenarioId;
    createdAt;
    executedAt;
    completedAt;
    status;
    constructor(id, name, description, testType, scenarioId, createdAt, executedAt, completedAt, status = TestStatus.CREATED) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.testType = testType;
        this.scenarioId = scenarioId;
        this.createdAt = createdAt;
        this.executedAt = executedAt;
        this.completedAt = completedAt;
        this.status = status;
    }
    static create(name, description, testType, scenarioId) {
        return new PerformanceTest(uuid_1.UUID.generate(), name, description, testType, scenarioId, new Date());
    }
    startExecution() {
        this.executedAt = new Date();
        this.status = TestStatus.RUNNING;
    }
    completeExecution() {
        this.completedAt = new Date();
        this.status = TestStatus.COMPLETED;
    }
    failExecution() {
        this.completedAt = new Date();
        this.status = TestStatus.FAILED;
    }
}
exports.PerformanceTest = PerformanceTest;
class TestScenario {
    id;
    name;
    description;
    endpoints;
    config;
    createdAt;
    updatedAt;
    constructor(id, name, description, endpoints, config, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.endpoints = endpoints;
        this.config = config;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(name, description, endpoints, config) {
        const now = new Date();
        return new TestScenario(uuid_1.UUID.generate(), name, description, endpoints, config, now, now);
    }
    update(name, description, endpoints, config) {
        if (name)
            this.name = name;
        if (description)
            this.description = description;
        if (endpoints)
            this.endpoints = endpoints;
        if (config)
            this.config = config;
        this.updatedAt = new Date();
    }
}
exports.TestScenario = TestScenario;
class TestResult {
    id;
    testId;
    metrics;
    summary;
    createdAt;
    constructor(id, testId, metrics, summary, createdAt) {
        this.id = id;
        this.testId = testId;
        this.metrics = metrics;
        this.summary = summary;
        this.createdAt = createdAt;
    }
    static create(testId, metrics, summary) {
        return new TestResult(uuid_1.UUID.generate(), testId, metrics, summary, new Date());
    }
}
exports.TestResult = TestResult;
class PerformanceReport {
    id;
    testId;
    testName;
    testType;
    executedAt;
    summary;
    metrics;
    analysis;
    recommendations;
    createdAt;
    constructor(id, testId, testName, testType, executedAt, summary, metrics, analysis, recommendations, createdAt) {
        this.id = id;
        this.testId = testId;
        this.testName = testName;
        this.testType = testType;
        this.executedAt = executedAt;
        this.summary = summary;
        this.metrics = metrics;
        this.analysis = analysis;
        this.recommendations = recommendations;
        this.createdAt = createdAt;
    }
    static create(testId, testName, testType, executedAt, summary, metrics, analysis, recommendations) {
        return new PerformanceReport(uuid_1.UUID.generate(), testId, testName, testType, executedAt, summary, metrics, analysis, recommendations, new Date());
    }
}
exports.PerformanceReport = PerformanceReport;
//# sourceMappingURL=PerformanceTest.js.map