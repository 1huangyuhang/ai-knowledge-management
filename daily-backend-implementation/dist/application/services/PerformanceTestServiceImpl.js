"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorServiceImpl = exports.TestAnalyzerServiceImpl = exports.TestScenarioServiceImpl = exports.PerformanceTestServiceImpl = void 0;
const PerformanceTest_1 = require("../../domain/entities/PerformanceTest");
class PerformanceTestServiceImpl {
    performanceTestRepository;
    testScenarioRepository;
    testResultRepository;
    performanceReportRepository;
    testAnalyzerService;
    reportGeneratorService;
    constructor(performanceTestRepository, testScenarioRepository, testResultRepository, performanceReportRepository, testAnalyzerService, reportGeneratorService) {
        this.performanceTestRepository = performanceTestRepository;
        this.testScenarioRepository = testScenarioRepository;
        this.testResultRepository = testResultRepository;
        this.performanceReportRepository = performanceReportRepository;
        this.testAnalyzerService = testAnalyzerService;
        this.reportGeneratorService = reportGeneratorService;
    }
    async createTest(name, description, testType, scenarioId) {
        const scenario = await this.testScenarioRepository.findById(scenarioId);
        if (!scenario) {
            throw new Error(`Test scenario with ID ${scenarioId.value} not found`);
        }
        const test = PerformanceTest_1.PerformanceTest.create(name, description, testType, scenarioId);
        await this.performanceTestRepository.create(test);
        return test;
    }
    async runTest(testId) {
        const test = await this.performanceTestRepository.findById(testId);
        if (!test) {
            throw new Error(`Performance test with ID ${testId.value} not found`);
        }
        const scenario = await this.testScenarioRepository.findById(test.scenarioId);
        if (!scenario) {
            throw new Error(`Test scenario with ID ${test.scenarioId.value} not found`);
        }
        test.startExecution();
        await this.performanceTestRepository.update(test);
        try {
            const metrics = this.generateMockMetrics(scenario);
            const summary = this.generateMockSummary(metrics);
            const result = PerformanceTest_1.TestResult.create(testId, metrics, summary);
            await this.testResultRepository.create(result);
            const analysis = await this.testAnalyzerService.analyzeTestResult(result);
            const recommendations = await this.testAnalyzerService.generateRecommendations(analysis);
            const report = await this.reportGeneratorService.generateReport(test, [result], analysis, recommendations);
            await this.performanceReportRepository.create(report);
            test.completeExecution();
            await this.performanceTestRepository.update(test);
            return test;
        }
        catch (error) {
            test.failExecution();
            await this.performanceTestRepository.update(test);
            throw error;
        }
    }
    async getTestResults(testId) {
        return this.testResultRepository.findByTestId(testId);
    }
    async getTestDetails(testId) {
        const test = await this.performanceTestRepository.findById(testId);
        if (!test) {
            throw new Error(`Performance test with ID ${testId.value} not found`);
        }
        return test;
    }
    async getAllTests() {
        return this.performanceTestRepository.findAll();
    }
    async getPerformanceReport(testId) {
        const report = await this.performanceReportRepository.findByTestId(testId);
        if (!report) {
            throw new Error(`Performance report for test ID ${testId.value} not found`);
        }
        return report;
    }
    generateMockMetrics(scenario) {
        const metrics = [];
        const now = new Date();
        scenario.endpoints.forEach(endpoint => {
            for (let i = 0; i < 10; i++) {
                metrics.push({
                    name: 'response_time',
                    value: Math.floor(Math.random() * 500) + 50,
                    unit: 'ms',
                    timestamp: new Date(now.getTime() - (i * 1000)),
                    endpoint: endpoint.url
                });
            }
            metrics.push({
                name: 'success_rate',
                value: Math.random() > 0.05 ? 100 : 95,
                unit: '%',
                timestamp: now,
                endpoint: endpoint.url
            });
        });
        metrics.push({
            name: 'cpu_usage',
            value: Math.floor(Math.random() * 50) + 20,
            unit: '%',
            timestamp: now
        });
        metrics.push({
            name: 'memory_usage',
            value: Math.floor(Math.random() * 400) + 100,
            unit: 'MB',
            timestamp: now
        });
        return metrics;
    }
    generateMockSummary(metrics) {
        const responseTimes = metrics
            .filter(m => m.name === 'response_time')
            .map(m => m.value);
        const totalRequests = responseTimes.length;
        const successfulRequests = Math.floor(totalRequests * (Math.random() > 0.05 ? 1 : 0.95));
        return {
            totalRequests,
            successfulRequests,
            failedRequests: totalRequests - successfulRequests,
            averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            throughput: Math.floor(Math.random() * 1000) + 500,
            errorRate: (totalRequests - successfulRequests) / totalRequests * 100,
            cpuUsage: metrics.find(m => m.name === 'cpu_usage')?.value,
            memoryUsage: metrics.find(m => m.name === 'memory_usage')?.value
        };
    }
}
exports.PerformanceTestServiceImpl = PerformanceTestServiceImpl;
class TestScenarioServiceImpl {
    testScenarioRepository;
    constructor(testScenarioRepository) {
        this.testScenarioRepository = testScenarioRepository;
    }
    async createScenario(name, description, endpoints, config) {
        const scenario = PerformanceTest_1.TestScenario.create(name, description, endpoints, config);
        await this.testScenarioRepository.create(scenario);
        return scenario;
    }
    async updateScenario(id, name, description, endpoints, config) {
        const scenario = await this.testScenarioRepository.findById(id);
        if (!scenario) {
            throw new Error(`Test scenario with ID ${id.value} not found`);
        }
        scenario.update(name, description, endpoints, config);
        await this.testScenarioRepository.update(scenario);
        return scenario;
    }
    async getScenarioDetails(id) {
        const scenario = await this.testScenarioRepository.findById(id);
        if (!scenario) {
            throw new Error(`Test scenario with ID ${id.value} not found`);
        }
        return scenario;
    }
    async getAllScenarios() {
        return this.testScenarioRepository.findAll();
    }
}
exports.TestScenarioServiceImpl = TestScenarioServiceImpl;
class TestAnalyzerServiceImpl {
    async analyzeTestResult(testResult) {
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
    async identifyBottlenecks(metrics) {
        const bottlenecks = [];
        const avgResponseTime = metrics
            .filter(m => m.name === 'response_time')
            .reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.name === 'response_time').length;
        if (avgResponseTime > 300) {
            bottlenecks.push('High average response time');
        }
        const errorRateMetric = metrics.find(m => m.name === 'success_rate');
        if (errorRateMetric && errorRateMetric.value < 99) {
            bottlenecks.push('High error rate');
        }
        const cpuUsageMetric = metrics.find(m => m.name === 'cpu_usage');
        if (cpuUsageMetric && cpuUsageMetric.value > 80) {
            bottlenecks.push('High CPU usage');
        }
        const memoryUsageMetric = metrics.find(m => m.name === 'memory_usage');
        if (memoryUsageMetric && memoryUsageMetric.value > 400) {
            bottlenecks.push('High memory usage');
        }
        return bottlenecks;
    }
    async generateRecommendations(analysis) {
        const recommendations = [];
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
        if (recommendations.length === 0) {
            recommendations.push('Performance is good, consider regular monitoring');
            recommendations.push('Review and optimize code periodically');
        }
        return recommendations;
    }
    async calculatePerformanceScore(metrics) {
        let score = 100;
        const avgResponseTime = metrics
            .filter(m => m.name === 'response_time')
            .reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.name === 'response_time').length;
        if (avgResponseTime > 500)
            score -= 30;
        else if (avgResponseTime > 300)
            score -= 20;
        else if (avgResponseTime > 100)
            score -= 10;
        const successRate = metrics.find(m => m.name === 'success_rate')?.value || 100;
        score -= (100 - successRate) * 0.3;
        const cpuUsage = metrics.find(m => m.name === 'cpu_usage')?.value || 0;
        if (cpuUsage > 80)
            score -= 20;
        else if (cpuUsage > 60)
            score -= 10;
        else if (cpuUsage > 40)
            score -= 5;
        const memoryUsage = metrics.find(m => m.name === 'memory_usage')?.value || 0;
        if (memoryUsage > 500)
            score -= 20;
        else if (memoryUsage > 400)
            score -= 10;
        else if (memoryUsage > 300)
            score -= 5;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    identifyTrends(metrics) {
        const metricsByType = metrics.reduce((groups, metric) => {
            if (!groups[metric.name]) {
                groups[metric.name] = [];
            }
            groups[metric.name].push(metric);
            return groups;
        }, {});
        const trends = {};
        for (const [name, typeMetrics] of Object.entries(metricsByType)) {
            if (typeMetrics.length < 2)
                continue;
            const sortedMetrics = typeMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            const firstValue = sortedMetrics[0].value;
            const lastValue = sortedMetrics[sortedMetrics.length - 1].value;
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
exports.TestAnalyzerServiceImpl = TestAnalyzerServiceImpl;
class ReportGeneratorServiceImpl {
    async generateReport(test, results, analysis, recommendations) {
        if (!results || results.length === 0) {
            throw new Error('No test results available for report generation');
        }
        const latestResult = results[0];
        const report = PerformanceTest_1.PerformanceReport.create(test.id, test.name, test.testType, test.executedAt || new Date(), latestResult.summary, latestResult.metrics, analysis, recommendations);
        await this.saveReport(report);
        return report;
    }
    async generateHtmlReport(report) {
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
                ${report.analysis.bottlenecks.map((b) => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <h2>Recommendations</h2>
          <div class="recommendations">
            <ul>
              ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
    }
    async generateJsonReport(report) {
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
    async saveReport(report) {
    }
}
exports.ReportGeneratorServiceImpl = ReportGeneratorServiceImpl;
//# sourceMappingURL=PerformanceTestServiceImpl.js.map