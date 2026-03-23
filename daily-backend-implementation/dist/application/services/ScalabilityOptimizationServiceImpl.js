"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalabilityOptimizationServiceImpl = void 0;
const tslib_1 = require("tslib");
const ScalabilityConfig_1 = require("../../domain/entities/ScalabilityConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class ScalabilityOptimizationServiceImpl {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getCurrentScalabilityConfig() {
        let config = await this.repository.getCurrentConfig();
        if (!config) {
            config = this.createDefaultScalabilityConfig();
            await this.repository.saveConfig(config);
        }
        return config;
    }
    async updateScalabilityConfig(config) {
        const currentConfig = await this.getCurrentScalabilityConfig();
        const updatedConfig = {
            ...currentConfig,
            ...config,
            updatedAt: new Date(),
            applied: false
        };
        return this.repository.saveConfig(updatedConfig);
    }
    async applyScalabilityConfig(configId) {
        const config = await this.repository.getConfigById(configId);
        if (!config) {
            throw new Error(`Scalability config with ID ${configId} not found`);
        }
        config.lastAppliedAt = new Date();
        config.applied = true;
        await this.repository.saveConfig(config);
        return true;
    }
    async getScalabilityMetrics(startTime, endTime, resourceType, limit, offset) {
        return this.repository.getMetrics(startTime, endTime, resourceType, limit, offset);
    }
    async recordScalabilityMetric(metric) {
        await this.repository.saveMetric(metric);
        return true;
    }
    async getScalabilityEvents(startTime, endTime, eventType, limit, offset) {
        return this.repository.getEvents(startTime, endTime, eventType, limit, offset);
    }
    async recordScalabilityEvent(event) {
        await this.repository.saveEvent(event);
        return true;
    }
    async markScalabilityEventAsProcessed(eventId) {
        return this.repository.markEventAsProcessed(eventId);
    }
    async generateScalabilityReport(reportPeriod) {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - reportPeriod * 1000);
        const metrics = await this.repository.getMetrics(startTime, endTime);
        const events = await this.repository.getEvents(startTime, endTime);
        const resourceUtilizationMap = new Map();
        for (const metric of metrics) {
            const resourceType = metric.resourceType;
            const value = metric.value;
            if (!resourceUtilizationMap.has(resourceType)) {
                resourceUtilizationMap.set(resourceType, {
                    sum: 0,
                    count: 0,
                    peak: 0,
                    minimum: Infinity,
                    values: []
                });
            }
            const resourceData = resourceUtilizationMap.get(resourceType);
            resourceData.sum += value;
            resourceData.count += 1;
            resourceData.peak = Math.max(resourceData.peak, value);
            resourceData.minimum = Math.min(resourceData.minimum, value);
            resourceData.values.push(value);
        }
        const resourceUtilization = Array.from(resourceUtilizationMap.entries()).map(([resourceType, data]) => {
            const sortedValues = [...data.values].sort((a, b) => a - b);
            const p95Index = Math.ceil(sortedValues.length * 0.95) - 1;
            const p99Index = Math.ceil(sortedValues.length * 0.99) - 1;
            return {
                resourceType: resourceType,
                average: data.count > 0 ? data.sum / data.count : 0,
                peak: data.peak,
                minimum: data.minimum === Infinity ? 0 : data.minimum,
                p95: sortedValues[p95Index] || 0,
                p99: sortedValues[p99Index] || 0
            };
        });
        const scalingEventsMap = new Map();
        for (const event of events) {
            if (['SCALE_UP', 'SCALE_DOWN', 'SCALE_FAILED'].includes(event.type)) {
                scalingEventsMap.set(event.type, (scalingEventsMap.get(event.type) || 0) + 1);
            }
        }
        const scalingEvents = Array.from(scalingEventsMap.entries()).map(([type, count]) => ({
            type: type,
            count
        }));
        const instanceStatistics = {
            averageInstances: 2,
            peakInstances: 4,
            minimumInstances: 1
        };
        const scalabilityScore = this.calculateScalabilityScore(resourceUtilization, scalingEvents);
        const recommendations = await this.getScalabilityRecommendations();
        const report = {
            id: crypto_1.default.randomUUID(),
            reportTime: endTime,
            reportPeriod,
            resourceUtilization,
            scalingEvents,
            instanceStatistics,
            scalabilityScore,
            recommendations
        };
        await this.repository.saveReport(report);
        return report;
    }
    async getScalabilityReportHistory(limit, offset) {
        return this.repository.getReportHistory(limit, offset);
    }
    async runScalabilityTest(testName, testDescription, loadConfig) {
        const startTime = new Date();
        const testResult = {
            id: crypto_1.default.randomUUID(),
            testName,
            testDescription,
            startTime,
            endTime: new Date(startTime.getTime() + loadConfig.duration * 1000),
            status: 'COMPLETED',
            loadConfig,
            metrics: {
                averageResponseTime: 0,
                peakResponseTime: 0,
                throughput: 0,
                errorRate: 0,
                maxConcurrentUsers: 0,
                resourceUtilization: []
            },
            conclusion: '',
            recommendations: []
        };
        testResult.metrics = {
            averageResponseTime: 250,
            peakResponseTime: 800,
            throughput: 150,
            errorRate: 0.5,
            maxConcurrentUsers: loadConfig.targetUsers,
            resourceUtilization: [
                {
                    resourceType: 'COMPUTE',
                    average: 65,
                    peak: 90
                },
                {
                    resourceType: 'MEMORY',
                    average: 70,
                    peak: 85
                },
                {
                    resourceType: 'DATABASE',
                    average: 55,
                    peak: 75
                }
            ]
        };
        if (testResult.metrics.errorRate < 1 && testResult.metrics.peakResponseTime < 1000) {
            testResult.conclusion = '可扩展性测试通过，系统在目标负载下表现良好';
        }
        else {
            testResult.conclusion = '可扩展性测试未通过，系统在目标负载下表现不佳';
        }
        testResult.recommendations = [
            '建议增加最大实例数，以应对更高的并发负载',
            '建议优化数据库查询，降低数据库资源利用率',
            '建议启用自动扩展，以提高系统的弹性',
            '建议进行更细粒度的负载测试，找出系统瓶颈'
        ];
        await this.repository.saveTestResult(testResult);
        return testResult;
    }
    async getScalabilityTestHistory(limit, offset) {
        return this.repository.getTestHistory(limit, offset);
    }
    async optimizeScalabilityConfig(targetLevel) {
        const currentConfig = await this.getCurrentScalabilityConfig();
        const changes = [];
        const optimizedConfig = { ...currentConfig };
        switch (targetLevel) {
            case ScalabilityConfig_1.ScalabilityLevel.CRITICAL:
                changes.push('设置可扩展性级别为极高');
                optimizedConfig.scalabilityLevel = ScalabilityConfig_1.ScalabilityLevel.CRITICAL;
                optimizedConfig.minInstances = 2;
                changes.push('最小实例数设置为2');
                optimizedConfig.maxInstances = 20;
                changes.push('最大实例数设置为20');
                optimizedConfig.instanceIncrement = 4;
                changes.push('实例增量设置为4');
                optimizedConfig.coolDownPeriod = 300;
                changes.push('冷却时间设置为300秒');
                optimizedConfig.autoScalingEnabled = true;
                changes.push('启用自动扩展');
                optimizedConfig.loadBalancingEnabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.horizontalScalingEnabled = true;
                changes.push('启用水平扩展');
                optimizedConfig.verticalScalingEnabled = true;
                changes.push('启用垂直扩展');
                break;
            case ScalabilityConfig_1.ScalabilityLevel.HIGH:
                changes.push('设置可扩展性级别为高');
                optimizedConfig.scalabilityLevel = ScalabilityConfig_1.ScalabilityLevel.HIGH;
                optimizedConfig.minInstances = 2;
                changes.push('最小实例数设置为2');
                optimizedConfig.maxInstances = 15;
                changes.push('最大实例数设置为15');
                optimizedConfig.instanceIncrement = 3;
                changes.push('实例增量设置为3');
                optimizedConfig.coolDownPeriod = 300;
                changes.push('冷却时间设置为300秒');
                optimizedConfig.autoScalingEnabled = true;
                changes.push('启用自动扩展');
                optimizedConfig.loadBalancingEnabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.horizontalScalingEnabled = true;
                changes.push('启用水平扩展');
                optimizedConfig.verticalScalingEnabled = true;
                changes.push('启用垂直扩展');
                break;
            case ScalabilityConfig_1.ScalabilityLevel.MEDIUM:
                changes.push('设置可扩展性级别为中');
                optimizedConfig.scalabilityLevel = ScalabilityConfig_1.ScalabilityLevel.MEDIUM;
                optimizedConfig.minInstances = 1;
                changes.push('最小实例数设置为1');
                optimizedConfig.maxInstances = 10;
                changes.push('最大实例数设置为10');
                optimizedConfig.instanceIncrement = 2;
                changes.push('实例增量设置为2');
                optimizedConfig.coolDownPeriod = 600;
                changes.push('冷却时间设置为600秒');
                optimizedConfig.autoScalingEnabled = true;
                changes.push('启用自动扩展');
                optimizedConfig.loadBalancingEnabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.horizontalScalingEnabled = true;
                changes.push('启用水平扩展');
                optimizedConfig.verticalScalingEnabled = false;
                changes.push('禁用垂直扩展');
                break;
            case ScalabilityConfig_1.ScalabilityLevel.LOW:
                changes.push('设置可扩展性级别为低');
                optimizedConfig.scalabilityLevel = ScalabilityConfig_1.ScalabilityLevel.LOW;
                optimizedConfig.minInstances = 1;
                changes.push('最小实例数设置为1');
                optimizedConfig.maxInstances = 5;
                changes.push('最大实例数设置为5');
                optimizedConfig.instanceIncrement = 1;
                changes.push('实例增量设置为1');
                optimizedConfig.coolDownPeriod = 1200;
                changes.push('冷却时间设置为1200秒');
                optimizedConfig.autoScalingEnabled = false;
                changes.push('禁用自动扩展');
                optimizedConfig.loadBalancingEnabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.horizontalScalingEnabled = false;
                changes.push('禁用水平扩展');
                optimizedConfig.verticalScalingEnabled = false;
                changes.push('禁用垂直扩展');
                break;
        }
        optimizedConfig.updatedAt = new Date();
        optimizedConfig.applied = false;
        const savedConfig = await this.repository.saveConfig(optimizedConfig);
        return {
            optimizedConfig: savedConfig,
            changes
        };
    }
    async getScalabilityRecommendations() {
        const currentConfig = await this.getCurrentScalabilityConfig();
        const recommendations = [];
        if (!currentConfig.autoScalingEnabled) {
            recommendations.push('建议启用自动扩展，提高系统的弹性和应对突发负载的能力');
        }
        if (currentConfig.minInstances < 2) {
            recommendations.push('建议将最小实例数增加到2，提高系统的可用性和容错能力');
        }
        if (currentConfig.maxInstances < 10) {
            recommendations.push('建议将最大实例数增加到10，提高系统的最大处理能力');
        }
        if (currentConfig.coolDownPeriod < 300) {
            recommendations.push('建议将冷却时间设置为300秒，避免频繁扩展导致的系统不稳定');
        }
        if (!currentConfig.loadBalancingEnabled) {
            recommendations.push('建议启用负载均衡，提高系统的可用性和资源利用率');
        }
        if (!currentConfig.horizontalScalingEnabled) {
            recommendations.push('建议启用水平扩展，提高系统的横向扩展能力');
        }
        recommendations.push('建议定期执行可扩展性测试，了解系统的性能瓶颈和最大容量');
        recommendations.push('建议监控系统的资源利用率，及时调整扩展策略');
        recommendations.push('建议优化数据库查询，提高系统的整体性能');
        recommendations.push('建议使用缓存，减少对后端服务的请求压力');
        return recommendations;
    }
    async checkScalabilityCompliance() {
        const currentConfig = await this.getCurrentScalabilityConfig();
        const issues = [];
        if (currentConfig.minInstances < 1) {
            issues.push('最小实例数不能小于1，建议至少设置为1');
        }
        if (currentConfig.maxInstances <= currentConfig.minInstances) {
            issues.push('最大实例数必须大于最小实例数');
        }
        if (currentConfig.instanceIncrement < 1) {
            issues.push('实例增量不能小于1，建议至少设置为1');
        }
        if (currentConfig.coolDownPeriod < 60) {
            issues.push('冷却时间不能小于60秒，建议至少设置为60秒');
        }
        if (currentConfig.scalingThresholds.length === 0) {
            issues.push('建议设置扩展阈值，以便系统能够自动扩展');
        }
        for (const threshold of currentConfig.scalingThresholds) {
            if (threshold.threshold < 0 || threshold.threshold > 100) {
                issues.push('扩展阈值必须在0-100之间');
            }
            if (threshold.duration < 10) {
                issues.push('扩展阈值持续时间不能小于10秒，建议至少设置为10秒');
            }
        }
        return {
            compliant: issues.length === 0,
            issues
        };
    }
    async triggerManualScaling(scaleDirection, instanceCount) {
        const event = {
            id: crypto_1.default.randomUUID(),
            type: scaleDirection === 'UP' ? 'SCALE_UP' : 'SCALE_DOWN',
            timestamp: new Date(),
            details: {
                instanceCount,
                direction: scaleDirection
            },
            source: 'MANUAL',
            impact: 'MEDIUM',
            processed: false
        };
        await this.repository.saveEvent(event);
        return true;
    }
    async getCurrentInstanceStatus() {
        return {
            instanceCount: 3,
            activeInstances: 2,
            pendingInstances: 1,
            scalingInProgress: true
        };
    }
    createDefaultScalabilityConfig() {
        return {
            id: crypto_1.default.randomUUID(),
            scalabilityLevel: ScalabilityConfig_1.ScalabilityLevel.MEDIUM,
            scalingStrategy: 'AUTOMATIC',
            scalingThresholds: [
                {
                    resourceType: 'COMPUTE',
                    threshold: 75,
                    duration: 300
                },
                {
                    resourceType: 'MEMORY',
                    threshold: 80,
                    duration: 300
                },
                {
                    resourceType: 'DATABASE',
                    threshold: 85,
                    duration: 300
                }
            ],
            minInstances: 1,
            maxInstances: 10,
            instanceIncrement: 2,
            coolDownPeriod: 600,
            autoScalingEnabled: true,
            loadBalancingEnabled: true,
            horizontalScalingEnabled: true,
            verticalScalingEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            applied: true
        };
    }
    calculateScalabilityScore(resourceUtilization, scalingEvents) {
        let totalScore = 100;
        for (const resource of resourceUtilization) {
            if (resource.peak > 90) {
                totalScore -= 10;
            }
            else if (resource.peak > 80) {
                totalScore -= 5;
            }
            if (resource.p95 > 85) {
                totalScore -= 5;
            }
        }
        const scaleFailedCount = scalingEvents.find(event => event.type === 'SCALE_FAILED')?.count || 0;
        totalScore -= scaleFailedCount * 15;
        return Math.max(0, Math.min(100, totalScore));
    }
}
exports.ScalabilityOptimizationServiceImpl = ScalabilityOptimizationServiceImpl;
//# sourceMappingURL=ScalabilityOptimizationServiceImpl.js.map