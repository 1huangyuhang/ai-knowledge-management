import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UUID } from '../../../domain/value-objects/uuid';
import {
  PerformanceTestService,
  TestScenarioService
} from '../../../domain/services/PerformanceTestService';
import { TestType } from '../../../domain/entities/PerformanceTest';
import { container } from '../../../di/container';

/**
 * 性能测试API控制器
 */
export class PerformanceTestController {
  private performanceTestService: PerformanceTestService;
  private testScenarioService: TestScenarioService;

  constructor() {
    this.performanceTestService = container.resolve('PerformanceTestService');
    this.testScenarioService = container.resolve('TestScenarioService');
  }

  /**
   * 注册路由
   */
  registerRoutes(fastify: FastifyInstance): void {
    // 性能测试路由
    fastify.post('/api/performance-tests', this.createTest.bind(this));
    fastify.get('/api/performance-tests', this.getAllTests.bind(this));
    fastify.get('/api/performance-tests/:id', this.getTestDetails.bind(this));
    fastify.post('/api/performance-tests/:id/run', this.runTest.bind(this));
    fastify.get('/api/performance-tests/:id/results', this.getTestResults.bind(this));
    fastify.get('/api/performance-tests/:id/report', this.getPerformanceReport.bind(this));
    fastify.get('/api/performance-tests/:id/report/html', this.generateHtmlReport.bind(this));
    fastify.get('/api/performance-tests/:id/report/json', this.generateJsonReport.bind(this));

    // 测试场景路由
    fastify.post('/api/test-scenarios', this.createScenario.bind(this));
    fastify.get('/api/test-scenarios', this.getAllScenarios.bind(this));
    fastify.get('/api/test-scenarios/:id', this.getScenarioDetails.bind(this));
    fastify.put('/api/test-scenarios/:id', this.updateScenario.bind(this));
  }

  /**
   * 创建性能测试
   */
  async createTest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { name, description, testType, scenarioId } = request.body as {
        name: string;
        description: string;
        testType: TestType;
        scenarioId: string;
      };

      const test = await this.performanceTestService.createTest(
        name,
        description,
        testType,
        UUID.fromString(scenarioId)
      );

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
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取所有性能测试
   */
  async getAllTests(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取测试详情
   */
  async getTestDetails(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const test = await this.performanceTestService.getTestDetails(UUID.fromString(id));
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
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 执行性能测试
   */
  async runTest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const test = await this.performanceTestService.runTest(UUID.fromString(id));
      reply.send({
        id: test.id.value,
        name: test.name,
        status: test.status,
        executedAt: test.executedAt?.toISOString()
      });
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取测试结果
   */
  async getTestResults(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const results = await this.performanceTestService.getTestResults(UUID.fromString(id));
      reply.send(results.map(result => ({
        id: result.id.value,
        testId: result.testId.value,
        summary: result.summary,
        metrics: result.metrics,
        createdAt: result.createdAt.toISOString()
      })));
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const report = await this.performanceTestService.getPerformanceReport(UUID.fromString(id));
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
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const report = await this.performanceTestService.getPerformanceReport(UUID.fromString(id));
      
      // 使用ReportGeneratorService生成HTML报告
      const reportGeneratorService = container.get('ReportGeneratorService');
      const htmlReport = await reportGeneratorService.generateHtmlReport(report);
      
      reply.header('Content-Type', 'text/html').send(htmlReport);
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 生成JSON报告
   */
  async generateJsonReport(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const report = await this.performanceTestService.getPerformanceReport(UUID.fromString(id));
      
      // 使用ReportGeneratorService生成JSON报告
      const reportGeneratorService = container.get('ReportGeneratorService');
      const jsonReport = await reportGeneratorService.generateJsonReport(report);
      
      reply.header('Content-Type', 'application/json').send(JSON.parse(jsonReport));
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 创建测试场景
   */
  async createScenario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { name, description, endpoints, config } = request.body as {
        name: string;
        description: string;
        endpoints: any[];
        config: any;
      };

      const scenario = await this.testScenarioService.createScenario(
        name,
        description,
        endpoints,
        config
      );

      reply.code(201).send({
        id: scenario.id.value,
        name: scenario.name,
        description: scenario.description,
        endpoints: scenario.endpoints,
        config: scenario.config,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString()
      });
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取所有测试场景
   */
  async getAllScenarios(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 获取测试场景详情
   */
  async getScenarioDetails(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const scenario = await this.testScenarioService.getScenarioDetails(UUID.fromString(id));
      reply.send({
        id: scenario.id.value,
        name: scenario.name,
        description: scenario.description,
        endpoints: scenario.endpoints,
        config: scenario.config,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString()
      });
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  /**
   * 更新测试场景
   */
  async updateScenario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const { name, description, endpoints, config } = request.body as {
        name?: string;
        description?: string;
        endpoints?: any[];
        config?: any;
      };

      const scenario = await this.testScenarioService.updateScenario(
        UUID.fromString(id),
        name,
        description,
        endpoints,
        config
      );

      reply.send({
        id: scenario.id.value,
        name: scenario.name,
        description: scenario.description,
        endpoints: scenario.endpoints,
        config: scenario.config,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString()
      });
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }
}
