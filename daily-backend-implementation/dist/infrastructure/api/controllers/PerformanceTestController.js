"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestController = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const container_1 = require("../../../di/container");
class PerformanceTestController {
    performanceTestService;
    testScenarioService;
    constructor() {
        this.performanceTestService = container_1.container.resolve('PerformanceTestService');
        this.testScenarioService = container_1.container.resolve('TestScenarioService');
    }
    registerRoutes(fastify) {
        fastify.post('/api/performance-tests', this.createTest.bind(this));
        fastify.get('/api/performance-tests', this.getAllTests.bind(this));
        fastify.get('/api/performance-tests/:id', this.getTestDetails.bind(this));
        fastify.post('/api/performance-tests/:id/run', this.runTest.bind(this));
        fastify.get('/api/performance-tests/:id/results', this.getTestResults.bind(this));
        fastify.get('/api/performance-tests/:id/report', this.getPerformanceReport.bind(this));
        fastify.get('/api/performance-tests/:id/report/html', this.generateHtmlReport.bind(this));
        fastify.get('/api/performance-tests/:id/report/json', this.generateJsonReport.bind(this));
        fastify.post('/api/test-scenarios', this.createScenario.bind(this));
        fastify.get('/api/test-scenarios', this.getAllScenarios.bind(this));
        fastify.get('/api/test-scenarios/:id', this.getScenarioDetails.bind(this));
        fastify.put('/api/test-scenarios/:id', this.updateScenario.bind(this));
    }
    async createTest(request, reply) {
        try {
            const { name, description, testType, scenarioId } = request.body;
            const test = await this.performanceTestService.createTest(name, description, testType, uuid_1.UUID.fromString(scenarioId));
            reply.code(201).send({
                id: test.id.value,
                name: test.name,
                description: test.description,
                testType: test.testType,
                scenarioId: test.scenarioId.value,
                status: test.status,
                createdAt: test.createdAt.toISOString(),
                executedAt: test.executedAt?.toISOString(),
                completedAt: test.completedAt?.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getAllTests(request, reply) {
        try {
            const tests = await this.performanceTestService.getAllTests();
            reply.send(tests.map(test => ({
                id: test.id.value,
                name: test.name,
                description: test.description,
                testType: test.testType,
                scenarioId: test.scenarioId.value,
                status: test.status,
                createdAt: test.createdAt.toISOString(),
                executedAt: test.executedAt?.toISOString(),
                completedAt: test.completedAt?.toISOString()
            })));
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getTestDetails(request, reply) {
        try {
            const { id } = request.params;
            const test = await this.performanceTestService.getTestDetails(uuid_1.UUID.fromString(id));
            reply.send({
                id: test.id.value,
                name: test.name,
                description: test.description,
                testType: test.testType,
                scenarioId: test.scenarioId.value,
                status: test.status,
                createdAt: test.createdAt.toISOString(),
                executedAt: test.executedAt?.toISOString(),
                completedAt: test.completedAt?.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async runTest(request, reply) {
        try {
            const { id } = request.params;
            const test = await this.performanceTestService.runTest(uuid_1.UUID.fromString(id));
            reply.send({
                id: test.id.value,
                name: test.name,
                status: test.status,
                executedAt: test.executedAt?.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getTestResults(request, reply) {
        try {
            const { id } = request.params;
            const results = await this.performanceTestService.getTestResults(uuid_1.UUID.fromString(id));
            reply.send(results.map(result => ({
                id: result.id.value,
                testId: result.testId.value,
                summary: result.summary,
                metrics: result.metrics,
                createdAt: result.createdAt.toISOString()
            })));
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getPerformanceReport(request, reply) {
        try {
            const { id } = request.params;
            const report = await this.performanceTestService.getPerformanceReport(uuid_1.UUID.fromString(id));
            reply.send({
                id: report.id.value,
                testId: report.testId.value,
                testName: report.testName,
                testType: report.testType,
                executedAt: report.executedAt.toISOString(),
                summary: report.summary,
                analysis: report.analysis,
                recommendations: report.recommendations,
                createdAt: report.createdAt.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async generateHtmlReport(request, reply) {
        try {
            const { id } = request.params;
            const report = await this.performanceTestService.getPerformanceReport(uuid_1.UUID.fromString(id));
            const reportGeneratorService = container_1.container.get('ReportGeneratorService');
            const htmlReport = await reportGeneratorService.generateHtmlReport(report);
            reply.header('Content-Type', 'text/html').send(htmlReport);
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async generateJsonReport(request, reply) {
        try {
            const { id } = request.params;
            const report = await this.performanceTestService.getPerformanceReport(uuid_1.UUID.fromString(id));
            const reportGeneratorService = container_1.container.get('ReportGeneratorService');
            const jsonReport = await reportGeneratorService.generateJsonReport(report);
            reply.header('Content-Type', 'application/json').send(JSON.parse(jsonReport));
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async createScenario(request, reply) {
        try {
            const { name, description, endpoints, config } = request.body;
            const scenario = await this.testScenarioService.createScenario(name, description, endpoints, config);
            reply.code(201).send({
                id: scenario.id.value,
                name: scenario.name,
                description: scenario.description,
                endpoints: scenario.endpoints,
                config: scenario.config,
                createdAt: scenario.createdAt.toISOString(),
                updatedAt: scenario.updatedAt.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getAllScenarios(request, reply) {
        try {
            const scenarios = await this.testScenarioService.getAllScenarios();
            reply.send(scenarios.map(scenario => ({
                id: scenario.id.value,
                name: scenario.name,
                description: scenario.description,
                endpoints: scenario.endpoints,
                config: scenario.config,
                createdAt: scenario.createdAt.toISOString(),
                updatedAt: scenario.updatedAt.toISOString()
            })));
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async getScenarioDetails(request, reply) {
        try {
            const { id } = request.params;
            const scenario = await this.testScenarioService.getScenarioDetails(uuid_1.UUID.fromString(id));
            reply.send({
                id: scenario.id.value,
                name: scenario.name,
                description: scenario.description,
                endpoints: scenario.endpoints,
                config: scenario.config,
                createdAt: scenario.createdAt.toISOString(),
                updatedAt: scenario.updatedAt.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
    async updateScenario(request, reply) {
        try {
            const { id } = request.params;
            const { name, description, endpoints, config } = request.body;
            const scenario = await this.testScenarioService.updateScenario(uuid_1.UUID.fromString(id), name, description, endpoints, config);
            reply.send({
                id: scenario.id.value,
                name: scenario.name,
                description: scenario.description,
                endpoints: scenario.endpoints,
                config: scenario.config,
                createdAt: scenario.createdAt.toISOString(),
                updatedAt: scenario.updatedAt.toISOString()
            });
        }
        catch (error) {
            reply.code(500).send({ error: error.message });
        }
    }
}
exports.PerformanceTestController = PerformanceTestController;
//# sourceMappingURL=PerformanceTestController.js.map