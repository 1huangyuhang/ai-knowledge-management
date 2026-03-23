import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class PerformanceTestController {
    private performanceTestService;
    private testScenarioService;
    constructor();
    registerRoutes(fastify: FastifyInstance): void;
    createTest(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getAllTests(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getTestDetails(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    runTest(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getTestResults(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getPerformanceReport(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateHtmlReport(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateJsonReport(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    createScenario(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getAllScenarios(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getScenarioDetails(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    updateScenario(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=PerformanceTestController.d.ts.map