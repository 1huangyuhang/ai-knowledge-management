import { UUID } from '../../domain/value-objects/uuid';
import {
  PerformanceTestService,
  TestScenarioService,
  TestAnalyzerService,
  ReportGeneratorService
} from '../../domain/services/PerformanceTestService';
import {
  PerformanceTestRepository,
  TestScenarioRepository,
  TestResultRepository,
  PerformanceReportRepository
} from '../../domain/repositories/PerformanceTestRepository';
import {
  PerformanceTest,
  TestScenario,
  TestResult,
  PerformanceReport,
  TestType,
  TestStatus,
  TestMetric,
  TestSummary,
  TestAnalysis
} from '../../domain/entities/PerformanceTest';

/**
 * 性能测试服务实现
 */
export class PerformanceTestServiceImpl implements PerformanceTestService {
  constructor(
    private readonly performanceTestRepository: PerformanceTestRepository,
    private readonly testScenarioRepository: TestScenarioRepository,
    private readonly testResultRepository: TestResultRepository,
    private readonly performanceReportRepository: PerformanceReportRepository,
    private readonly testAnalyzerService: TestAnalyzerService,
    private readonly reportGeneratorService: ReportGeneratorService
  ) {}

  async createTest(
    name: string,
    description: string,
    testType: TestType,
    scenarioId: UUID
  ): Promise<PerformanceTest> {
    // 验证场景是否存在
    const scenario = await this.testScenarioRepository.findById(scenarioId);
    if (!scenario) {
      throw new Error(`Test scenario with ID ${scenarioId.value} not found`);
    }

    // 创建性能测试
    const test = PerformanceTest.create(name, description, testType, scenarioId);
    await this.performanceTestRepository.create(test);
    return test;
  }

  async runTest(testId: UUID): Promise<PerformanceTest> {
    // 获取测试
    const test = await this.performanceTestRepository.findById(testId);
    if (!test) {
      throw new Error(`Performance test with ID ${testId.value} not found`);
    }

    // 获取场景
    const scenario = await this.testScenarioRepository.findById(test.scenarioId);
    if (!scenario) {
      throw new Error(`Test scenario with ID ${test.scenarioId.value} not found`);
    }

    // 更新测试状态为运行中
    test.startExecution();
    await this.performanceTestRepository.update(test);

    try {
      // 模拟测试执行（实际实现中应调用真实的测试运行器）
      const metrics: TestMetric[] = this.generateMockMetrics(scenario);
      const summary: TestSummary = this.generateMockSummary(metrics);

      // 创建测试结果
      const result = TestResult.create(testId, metrics, summary);
      await this.testResultRepository.create(result);

      // 分析测试结果
      const analysis = await this.testAnalyzerService.analyzeTestResult(result);
      const recommendations = await this.testAnalyzerService.generateRecommendations(analysis);

      // 生成性能报告
      const report = await this.reportGeneratorService.generateReport(
        test,
        [result],
        analysis,
        recommendations
      );
      await this.performanceReportRepository.create(report);

      // 更新测试状态为已完成
      test.completeExecution();
      await this.performanceTestRepository.update(test);

      return test;
    } catch (error) {
      // 更新测试状态为失败
      test.failExecution();
      await this.performanceTestRepository.update(test);
      throw error;
    }
  }

  async getTestResults(testId: UUID): Promise<TestResult[]> {
    return this.testResultRepository.findByTestId(testId);
  }

  async getTestDetails(testId: UUID): Promise<PerformanceTest> {
    const test = await this.performanceTestRepository.findById(testId);
    if (!test) {
      throw new Error(`Performance test with ID ${testId.value} not found`);
    }
    return test;
  }

  async getAllTests(): Promise<PerformanceTest[]> {
    return this.performanceTestRepository.findAll();
  }

  async getPerformanceReport(testId: UUID): Promise<PerformanceReport> {
    const report = await this.performanceReportRepository.findByTestId(testId);
    if (!report) {
      throw new Error(`Performance report for test ID ${testId.value} not found`);
    }
    return report;
  }

  /**
   * 生成模拟测试指标
   */
  private generateMockMetrics(scenario: TestScenario): TestMetric[] {
    const metrics: TestMetric[] = [];
    const now = new Date();

    // 为每个端点生成指标
    scenario.endpoints.forEach(endpoint => {
      // 生成响应时间指标
      for (let i = 0; i < 10; i++) {
        metrics.push({
          name: 'response_time',
          value: Math.floor(Math.random() * 500) + 50, // 50-550ms
          unit: 'ms',
          timestamp: new Date(now.getTime() - (i * 1000)),
          endpoint: endpoint.url
        });
      }

      // 生成成功率指标
      metrics.push({
        name: 'success_rate',
        value: Math.random() > 0.05 ? 100 : 95, // 95-100%
        unit: '%',
        timestamp: now,
        endpoint: endpoint.url
      });
    });

    // 生成系统指标
    metrics.push({
      name: 'cpu_usage',
      value: Math.floor(Math.random() * 50) + 20, // 20-70%
      unit: '%',
      timestamp: now
    });

    metrics.push({
      name: 'memory_usage',
      value: Math.floor(Math.random() * 400) + 100, // 100-500MB
      unit: 'MB',
      timestamp: now
    });

    return metrics;
  }

  /**
   * 生成模拟测试摘要
   */
  private generateMockSummary(metrics: TestMetric[]): TestSummary {
    const responseTimes = metrics
      .filter(m => m.name === 'response_time')
      .map(m => m.value as number);

    const totalRequests = responseTimes.length;
    const successfulRequests = Math.floor(totalRequests * (Math.random() > 0.05 ? 1 : 0.95));

    return {
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      throughput: Math.floor(Math.random() * 1000) + 500, // 500-1500 requests/second
      errorRate: (totalRequests - successfulRequests) / totalRequests * 100,
      cpuUsage: metrics.find(m => m.name === 'cpu_usage')?.value as number,
      memoryUsage: metrics.find(m => m.name === 'memory_usage')?.value as number
    };
  }
}

/**
 * 测试场景服务实现
 */
export class TestScenarioServiceImpl implements TestScenarioService {
  constructor(private readonly testScenarioRepository: TestScenarioRepository) {}

  async createScenario(
    name: string,
    description: string,
    endpoints: any[],
    config: any
  ): Promise<TestScenario> {
    const scenario = TestScenario.create(name, description, endpoints, config);
    await this.testScenarioRepository.create(scenario);
    return scenario;
  }

  async updateScenario(
    id: UUID,
    name?: string,
    description?: string,
    endpoints?: any[],
    config?: any
  ): Promise<TestScenario> {
    const scenario = await this.testScenarioRepository.findById(id);
    if (!scenario) {
      throw new Error(`Test scenario with ID ${id.value} not found`);
    }

    scenario.update(name, description, endpoints, config);
    await this.testScenarioRepository.update(scenario);
    return scenario;
  }

  async getScenarioDetails(id: UUID): Promise<TestScenario> {
    const scenario = await this.testScenarioRepository.findById(id);
    if (!scenario) {
      throw new Error(`Test scenario with ID ${id.value} not found`);
    }
    return scenario;
  }

  async getAllScenarios(): Promise<TestScenario[]> {
    return this.testScenarioRepository.findAll();
  }
}

/**
 * 测试分析服务实现
 */
export class TestAnalyzerServiceImpl implements TestAnalyzerService {
  async analyzeTestResult(testResult: TestResult): Promise<any> {
    // 分析测试指标
    const performanceScore = await this.calculatePerformanceScore(testResult.metrics);
    const bottlenecks = await this.identifyBottlenecks(testResult.metrics);
    const recommendations = await this.generateRecommendations({});

    return {
      performanceScore,
      bottlenecks,
      trends: this.identifyTrends(testResult.metrics),
      recommendations
    };
  }

  async identifyBottlenecks(metrics: any[]): Promise<string[]> {
    const bottlenecks: string[] = [];

    // 检查响应时间
    const avgResponseTime = metrics
      .filter(m => m.name === 'response_time')
      .reduce((sum, m) => sum + (m.value as number), 0) / metrics.filter(m => m.name === 'response_time').length;

    if (avgResponseTime > 300) {
      bottlenecks.push('High average response time');
    }

    // 检查错误率
    const errorRateMetric = metrics.find(m => m.name === 'success_rate');
    if (errorRateMetric && (errorRateMetric.value as number) < 99) {
      bottlenecks.push('High error rate');
    }

    // 检查CPU使用率
    const cpuUsageMetric = metrics.find(m => m.name === 'cpu_usage');
    if (cpuUsageMetric && (cpuUsageMetric.value as number) > 80) {
      bottlenecks.push('High CPU usage');
    }

    // 检查内存使用率
    const memoryUsageMetric = metrics.find(m => m.name === 'memory_usage');
    if (memoryUsageMetric && (memoryUsageMetric.value as number) > 400) {
      bottlenecks.push('High memory usage');
    }

    return bottlenecks;
  }

  async generateRecommendations(analysis: any): Promise<string[]> {
    const recommendations: string[] = [];

    // 根据分析结果生成建议
    if (analysis.bottlenecks?.includes('High average response time')) {
      recommendations.push('Optimize database queries and add caching');
      recommendations.push('Consider adding more server instances');
    }

    if (analysis.bottlenecks?.includes('High error rate')) {
      recommendations.push('Fix the root cause of failed requests');
      recommendations.push('Add retry mechanisms for transient failures');
    }

    if (analysis.bottlenecks?.includes('High CPU usage')) {
      recommendations.push('Optimize CPU-intensive operations');
      recommendations.push('Consider upgrading to more powerful servers');
    }

    if (analysis.bottlenecks?.includes('High memory usage')) {
      recommendations.push('Optimize memory usage in the application');
      recommendations.push('Add more RAM to servers');
    }

    // 默认建议
    if (recommendations.length === 0) {
      recommendations.push('Performance is good, consider regular monitoring');
      recommendations.push('Review and optimize code periodically');
    }

    return recommendations;
  }

  async calculatePerformanceScore(metrics: any[]): Promise<number> {
    let score = 100;

    // 响应时间评分（30%权重）
    const avgResponseTime = metrics
      .filter(m => m.name === 'response_time')
      .reduce((sum, m) => sum + (m.value as number), 0) / metrics.filter(m => m.name === 'response_time').length;
    if (avgResponseTime > 500) score -= 30;
    else if (avgResponseTime > 300) score -= 20;
    else if (avgResponseTime > 100) score -= 10;

    // 成功率评分（30%权重）
    const successRate = metrics.find(m => m.name === 'success_rate')?.value as number || 100;
    score -= (100 - successRate) * 0.3;

    // CPU使用率评分（20%权重）
    const cpuUsage = metrics.find(m => m.name === 'cpu_usage')?.value as number || 0;
    if (cpuUsage > 80) score -= 20;
    else if (cpuUsage > 60) score -= 10;
    else if (cpuUsage > 40) score -= 5;

    // 内存使用率评分（20%权重）
    const memoryUsage = metrics.find(m => m.name === 'memory_usage')?.value as number || 0;
    if (memoryUsage > 500) score -= 20;
    else if (memoryUsage > 400) score -= 10;
    else if (memoryUsage > 300) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 识别趋势
   */
  private identifyTrends(metrics: any[]): Record<string, any> {
    // 按名称分组指标
    const metricsByType = metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, any[]>);

    const trends: Record<string, any> = {};

    // 分析每个指标类型的趋势
    for (const [name, typeMetrics] of Object.entries(metricsByType)) {
      if (typeMetrics.length < 2) continue;

      // 按时间排序
      const sortedMetrics = typeMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // 计算趋势（简单的线性回归）
      const firstValue = sortedMetrics[0].value as number;
      const lastValue = sortedMetrics[sortedMetrics.length - 1].value as number;
      const change = lastValue - firstValue;
      const percentChange = (change / firstValue) * 100;

      trends[name] = {
        direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        change: Math.abs(change),
        percentChange: Math.abs(percentChange).toFixed(2)
      };
    }

    return trends;
  }
}

/**
 * 报告生成服务实现
 */
export class ReportGeneratorServiceImpl implements ReportGeneratorService {
  async generateReport(
    test: PerformanceTest,
    results: TestResult[],
    analysis: any,
    recommendations: string[]
  ): Promise<PerformanceReport> {
    if (!results || results.length === 0) {
      throw new Error('No test results available for report generation');
    }

    const latestResult = results[0];

    const report = PerformanceReport.create(
      test.id,
      test.name,
      test.testType,
      test.executedAt || new Date(),
      latestResult.summary,
      latestResult.metrics,
      analysis as TestAnalysis,
      recommendations
    );

    await this.saveReport(report);
    return report;
  }

  async generateHtmlReport(report: PerformanceReport): Promise<string> {
    // 生成简单的HTML报告
    return `
      <html>
        <head>
          <title>Performance Report - ${report.testName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; }
            h2 { color: #3498db; }
            .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
            .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; min-width: 200px; }
            .metric .name { font-weight: bold; }
            .metric .value { font-size: 24px; color: #27ae60; }
            .bottlenecks, .recommendations { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .recommendations { background: #d1ecf1; }
          </style>
        </head>
        <body>
          <h1>Performance Report</h1>
          <h2>${report.testName}</h2>
          <p><strong>Test Type:</strong> ${report.testType}</p>
          <p><strong>Executed At:</strong> ${report.executedAt.toLocaleString()}</p>
          <p><strong>Performance Score:</strong> ${report.analysis.performanceScore}/100</p>
          
          <h2>Test Summary</h2>
          <div class="metrics">
            <div class="metric">
              <div class="name">Total Requests</div>
              <div class="value">${report.summary.totalRequests}</div>
            </div>
            <div class="metric">
              <div class="name">Successful Requests</div>
              <div class="value">${report.summary.successfulRequests}</div>
            </div>
            <div class="metric">
              <div class="name">Failed Requests</div>
              <div class="value">${report.summary.failedRequests}</div>
            </div>
            <div class="metric">
              <div class="name">Average Response Time</div>
              <div class="value">${report.summary.averageResponseTime} ms</div>
            </div>
            <div class="metric">
              <div class="name">Throughput</div>
              <div class="value">${report.summary.throughput} req/s</div>
            </div>
            <div class="metric">
              <div class="name">Error Rate</div>
              <div class="value">${report.summary.errorRate.toFixed(2)}%</div>
            </div>
          </div>
          
          ${report.analysis.bottlenecks.length > 0 ? `
            <h2>Identified Bottlenecks</h2>
            <div class="bottlenecks">
              <ul>
                ${report.analysis.bottlenecks.map((b: string) => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <h2>Recommendations</h2>
          <div class="recommendations">
            <ul>
              ${report.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
  }

  async generateJsonReport(report: PerformanceReport): Promise<string> {
    // 生成JSON报告
    return JSON.stringify({
      id: report.id.value,
      testId: report.testId.value,
      testName: report.testName,
      testType: report.testType,
      executedAt: report.executedAt.toISOString(),
      summary: report.summary,
      analysis: report.analysis,
      recommendations: report.recommendations,
      createdAt: report.createdAt.toISOString()
    }, null, 2);
  }

  /**
   * 保存报告（在实际实现中应调用仓库保存）
   */
  private async saveReport(report: PerformanceReport): Promise<void> {
    // 这里可以添加报告保存逻辑
  }
}
