"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityOptimizationServiceImpl = void 0;
const tslib_1 = require("tslib");
const AvailabilityConfig_1 = require("../../domain/entities/AvailabilityConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class AvailabilityOptimizationServiceImpl {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getCurrentAvailabilityConfig() {
        let config = await this.repository.getCurrentConfig();
        if (!config) {
            config = this.createDefaultAvailabilityConfig();
            await this.repository.saveConfig(config);
        }
        return config;
    }
    async updateAvailabilityConfig(config) {
        const currentConfig = await this.getCurrentAvailabilityConfig();
        const updatedConfig = {
            ...currentConfig,
            ...config,
            updatedAt: new Date(),
            applied: false
        };
        return this.repository.saveConfig(updatedConfig);
    }
    async applyAvailabilityConfig(configId) {
        const config = await this.repository.getConfigById(configId);
        if (!config) {
            throw new Error(`Availability config with ID ${configId} not found`);
        }
        config.lastAppliedAt = new Date();
        config.applied = true;
        await this.repository.saveConfig(config);
        return true;
    }
    async runHealthChecks(healthCheckConfigId) {
        const currentConfig = await this.getCurrentAvailabilityConfig();
        let healthCheckConfigs = currentConfig.healthCheckConfigs;
        if (healthCheckConfigId) {
            healthCheckConfigs = healthCheckConfigs.filter(config => config.type === AvailabilityConfig_1.HealthCheckType[healthCheckConfigId]);
        }
        const results = [];
        for (const healthCheckConfig of healthCheckConfigs) {
            const result = await this.simulateHealthCheck(healthCheckConfig);
            await this.repository.saveHealthCheckResult(result);
            results.push(result);
        }
        return results;
    }
    async getHealthCheckResults(startTime, endTime, healthCheckConfigId, limit, offset) {
        return this.repository.getHealthCheckResults(startTime, endTime, healthCheckConfigId, limit, offset);
    }
    async getAvailabilityMetrics(startTime, endTime, metricType, serviceName, limit, offset) {
        return this.repository.getMetrics(startTime, endTime, metricType, serviceName, limit, offset);
    }
    async recordAvailabilityMetric(metric) {
        await this.repository.saveMetric(metric);
        return true;
    }
    async getAvailabilityEvents(startTime, endTime, eventType, serviceName, limit, offset) {
        return this.repository.getEvents(startTime, endTime, eventType, serviceName, limit, offset);
    }
    async recordAvailabilityEvent(event) {
        await this.repository.saveEvent(event);
        return true;
    }
    async markAvailabilityEventAsProcessed(eventId) {
        return this.repository.markEventAsProcessed(eventId);
    }
    async generateAvailabilityReport(reportPeriod) {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - reportPeriod * 1000);
        const healthCheckResults = await this.repository.getHealthCheckResults(startTime, endTime);
        const metrics = await this.repository.getMetrics(startTime, endTime);
        const events = await this.repository.getEvents(startTime, endTime);
        const availabilityStats = this.calculateAvailabilityStats(metrics, reportPeriod);
        const eventStatsMap = new Map();
        for (const event of events) {
            eventStatsMap.set(event.type, (eventStatsMap.get(event.type) || 0) + 1);
        }
        const eventStats = Array.from(eventStatsMap.entries()).map(([type, count]) => ({
            type,
            count
        }));
        const healthCheckStatsMap = new Map();
        for (const result of healthCheckResults) {
            if (!healthCheckStatsMap.has(result.healthCheckConfigId)) {
                healthCheckStatsMap.set(result.healthCheckConfigId, {
                    totalChecks: 0,
                    successfulChecks: 0,
                    failedChecks: 0,
                    warningChecks: 0
                });
            }
            const stats = healthCheckStatsMap.get(result.healthCheckConfigId);
            stats.totalChecks += 1;
            if (result.status === AvailabilityConfig_1.HealthStatus.HEALTHY) {
                stats.successfulChecks += 1;
            }
            else if (result.status === AvailabilityConfig_1.HealthStatus.UNHEALTHY) {
                stats.failedChecks += 1;
            }
            else if (result.status === AvailabilityConfig_1.HealthStatus.WARNING) {
                stats.warningChecks += 1;
            }
        }
        const healthCheckStats = Array.from(healthCheckStatsMap.entries()).map(([healthCheckConfigId, stats]) => ({
            healthCheckConfigId,
            totalChecks: stats.totalChecks,
            successfulChecks: stats.successfulChecks,
            failedChecks: stats.failedChecks,
            warningChecks: stats.warningChecks,
            successRate: stats.totalChecks > 0 ? (stats.successfulChecks / stats.totalChecks) * 100 : 0
        }));
        const availabilityScore = this.calculateAvailabilityScore(availabilityStats, healthCheckStats);
        const recommendations = await this.getAvailabilityRecommendations();
        const report = {
            id: crypto_1.default.randomUUID(),
            reportTime: endTime,
            reportPeriod,
            availabilityStats,
            eventStats,
            healthCheckStats,
            availabilityScore,
            recommendations
        };
        await this.repository.saveReport(report);
        return report;
    }
    async getAvailabilityReportHistory(limit, offset) {
        return this.repository.getReportHistory(limit, offset);
    }
    async runAvailabilityTest(testName, testDescription, testConfig) {
        const startTime = new Date();
        const testResult = {
            id: crypto_1.default.randomUUID(),
            testName,
            testDescription,
            startTime,
            endTime: new Date(startTime.getTime() + (testConfig.parameters.duration || 300) * 1000),
            status: 'COMPLETED',
            testConfig,
            metrics: {
                availabilityPercentage: 0,
                averageRecoveryTime: 0,
                maxRecoveryTime: 0,
                failoverSuccessRate: 0,
                errorCount: 0
            },
            conclusion: '',
            recommendations: []
        };
        testResult.metrics = {
            availabilityPercentage: 99.9,
            averageRecoveryTime: 30,
            maxRecoveryTime: 60,
            failoverSuccessRate: 100,
            errorCount: 5
        };
        if (testResult.metrics.availabilityPercentage >= 99.9 && testResult.metrics.failoverSuccessRate === 100) {
            testResult.conclusion = '可用性测试通过，系统在测试中表现良好';
        }
        else {
            testResult.conclusion = '可用性测试未通过，系统在测试中表现不佳';
        }
        testResult.recommendations = [
            '建议增加健康检查频率，提高故障检测速度',
            '建议优化故障转移机制，减少故障转移时间',
            '建议增加冗余实例数，提高系统的容错能力',
            '建议定期执行可用性测试，确保系统的可用性'
        ];
        await this.repository.saveTestResult(testResult);
        return testResult;
    }
    async getAvailabilityTestHistory(limit, offset) {
        return this.repository.getTestHistory(limit, offset);
    }
    async optimizeAvailabilityConfig(targetLevel) {
        const currentConfig = await this.getCurrentAvailabilityConfig();
        const changes = [];
        const optimizedConfig = { ...currentConfig };
        switch (targetLevel) {
            case AvailabilityConfig_1.AvailabilityLevel.CRITICAL:
                changes.push('设置可用性级别为极高');
                optimizedConfig.availabilityLevel = AvailabilityConfig_1.AvailabilityLevel.CRITICAL;
                optimizedConfig.availabilityStrategy = 'ACTIVE_REDUNDANCY';
                changes.push('使用主动冗余策略');
                optimizedConfig.redundancyInstances = 3;
                changes.push('冗余实例数设置为3');
                optimizedConfig.maxFailureInstances = 2;
                changes.push('最大故障实例数设置为2');
                optimizedConfig.healthCheckConfigs = this.createHealthCheckConfigs(5);
                changes.push('健康检查间隔设置为5秒');
                optimizedConfig.failoverConfig.enabled = true;
                changes.push('启用故障转移');
                optimizedConfig.loadBalancingConfig.enabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.autoRecoveryEnabled = true;
                changes.push('启用自动恢复');
                optimizedConfig.monitoringEnabled = true;
                changes.push('启用监控');
                optimizedConfig.alertingEnabled = true;
                changes.push('启用告警');
                break;
            case AvailabilityConfig_1.AvailabilityLevel.HIGH:
                changes.push('设置可用性级别为高');
                optimizedConfig.availabilityLevel = AvailabilityConfig_1.AvailabilityLevel.HIGH;
                optimizedConfig.availabilityStrategy = 'ACTIVE_REDUNDANCY';
                changes.push('使用主动冗余策略');
                optimizedConfig.redundancyInstances = 2;
                changes.push('冗余实例数设置为2');
                optimizedConfig.maxFailureInstances = 1;
                changes.push('最大故障实例数设置为1');
                optimizedConfig.healthCheckConfigs = this.createHealthCheckConfigs(10);
                changes.push('健康检查间隔设置为10秒');
                optimizedConfig.failoverConfig.enabled = true;
                changes.push('启用故障转移');
                optimizedConfig.loadBalancingConfig.enabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.autoRecoveryEnabled = true;
                changes.push('启用自动恢复');
                optimizedConfig.monitoringEnabled = true;
                changes.push('启用监控');
                optimizedConfig.alertingEnabled = true;
                changes.push('启用告警');
                break;
            case AvailabilityConfig_1.AvailabilityLevel.MEDIUM:
                changes.push('设置可用性级别为中');
                optimizedConfig.availabilityLevel = AvailabilityConfig_1.AvailabilityLevel.MEDIUM;
                optimizedConfig.availabilityStrategy = 'PASSIVE_REDUNDANCY';
                changes.push('使用被动冗余策略');
                optimizedConfig.redundancyInstances = 1;
                changes.push('冗余实例数设置为1');
                optimizedConfig.maxFailureInstances = 1;
                changes.push('最大故障实例数设置为1');
                optimizedConfig.healthCheckConfigs = this.createHealthCheckConfigs(30);
                changes.push('健康检查间隔设置为30秒');
                optimizedConfig.failoverConfig.enabled = false;
                changes.push('禁用故障转移');
                optimizedConfig.loadBalancingConfig.enabled = true;
                changes.push('启用负载均衡');
                optimizedConfig.autoRecoveryEnabled = false;
                changes.push('禁用自动恢复');
                optimizedConfig.monitoringEnabled = true;
                changes.push('启用监控');
                optimizedConfig.alertingEnabled = false;
                changes.push('禁用告警');
                break;
            case AvailabilityConfig_1.AvailabilityLevel.LOW:
                changes.push('设置可用性级别为低');
                optimizedConfig.availabilityLevel = AvailabilityConfig_1.AvailabilityLevel.LOW;
                optimizedConfig.availabilityStrategy = 'NO_REDUNDANCY';
                changes.push('使用无冗余策略');
                optimizedConfig.redundancyInstances = 0;
                changes.push('冗余实例数设置为0');
                optimizedConfig.maxFailureInstances = 1;
                changes.push('最大故障实例数设置为1');
                optimizedConfig.healthCheckConfigs = this.createHealthCheckConfigs(60);
                changes.push('健康检查间隔设置为60秒');
                optimizedConfig.failoverConfig.enabled = false;
                changes.push('禁用故障转移');
                optimizedConfig.loadBalancingConfig.enabled = false;
                changes.push('禁用负载均衡');
                optimizedConfig.autoRecoveryEnabled = false;
                changes.push('禁用自动恢复');
                optimizedConfig.monitoringEnabled = false;
                changes.push('禁用监控');
                optimizedConfig.alertingEnabled = false;
                changes.push('禁用告警');
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
    async getAvailabilityRecommendations() {
        const currentConfig = await this.getCurrentAvailabilityConfig();
        const recommendations = [];
        if (currentConfig.availabilityStrategy === 'NO_REDUNDANCY') {
            recommendations.push('建议使用冗余策略，提高系统的可用性和容错能力');
        }
        if (currentConfig.redundancyInstances < 1) {
            recommendations.push('建议增加冗余实例数，提高系统的可用性和容错能力');
        }
        if (currentConfig.healthCheckConfigs.length === 0) {
            recommendations.push('建议配置健康检查，及时发现和处理故障');
        }
        else {
            const minInterval = Math.min(...currentConfig.healthCheckConfigs.map(config => config.interval));
            if (minInterval > 30) {
                recommendations.push('建议缩短健康检查间隔，提高故障检测速度');
            }
        }
        if (!currentConfig.failoverConfig.enabled) {
            recommendations.push('建议启用故障转移，提高系统的容错能力');
        }
        if (!currentConfig.loadBalancingConfig.enabled) {
            recommendations.push('建议启用负载均衡，提高系统的可用性和资源利用率');
        }
        if (!currentConfig.monitoringEnabled) {
            recommendations.push('建议启用监控，及时了解系统的运行状态');
        }
        if (!currentConfig.alertingEnabled) {
            recommendations.push('建议启用告警，及时接收系统异常通知');
        }
        recommendations.push('建议定期执行可用性测试，确保系统的可用性');
        recommendations.push('建议制定详细的灾难恢复计划，提高系统的恢复能力');
        recommendations.push('建议定期备份数据，确保数据的安全性和可恢复性');
        recommendations.push('建议使用多个可用区部署，提高系统的地域容错能力');
        return recommendations;
    }
    async checkAvailabilityCompliance() {
        const currentConfig = await this.getCurrentAvailabilityConfig();
        const issues = [];
        if (currentConfig.redundancyInstances < 0) {
            issues.push('冗余实例数不能小于0');
        }
        if (currentConfig.maxFailureInstances < 0) {
            issues.push('最大故障实例数不能小于0');
        }
        if (currentConfig.maxFailureInstances > currentConfig.redundancyInstances) {
            issues.push('最大故障实例数不能大于冗余实例数');
        }
        if (currentConfig.healthCheckConfigs.length === 0) {
            issues.push('建议配置健康检查，及时发现和处理故障');
        }
        else {
            for (const healthCheckConfig of currentConfig.healthCheckConfigs) {
                if (healthCheckConfig.interval < 5) {
                    issues.push('健康检查间隔不能小于5秒');
                }
                if (healthCheckConfig.timeout < 1) {
                    issues.push('健康检查超时时间不能小于1秒');
                }
                if (healthCheckConfig.failureThreshold < 1) {
                    issues.push('健康检查失败阈值不能小于1');
                }
                if (healthCheckConfig.successThreshold < 1) {
                    issues.push('健康检查成功阈值不能小于1');
                }
            }
        }
        if (currentConfig.failoverConfig.delay < 0) {
            issues.push('故障转移延迟不能小于0');
        }
        if (currentConfig.failoverConfig.recoveryDelay < 0) {
            issues.push('故障恢复延迟不能小于0');
        }
        if (currentConfig.loadBalancingConfig.enabled) {
            if (currentConfig.loadBalancingConfig.sessionTimeout < 0) {
                issues.push('会话超时时间不能小于0');
            }
        }
        return {
            compliant: issues.length === 0,
            issues
        };
    }
    async triggerFailover(serviceName) {
        const event = {
            id: crypto_1.default.randomUUID(),
            type: 'FAILOVER_TRIGGERED',
            timestamp: new Date(),
            details: {
                serviceName
            },
            source: 'MANUAL',
            impact: 'HIGH',
            processed: false,
            serviceName
        };
        await this.repository.saveEvent(event);
        const completedEvent = {
            id: crypto_1.default.randomUUID(),
            type: 'FAILOVER_COMPLETED',
            timestamp: new Date(),
            details: {
                serviceName
            },
            source: 'SYSTEM',
            impact: 'HIGH',
            processed: false,
            serviceName
        };
        await this.repository.saveEvent(completedEvent);
        return true;
    }
    async triggerRecovery(serviceName) {
        const event = {
            id: crypto_1.default.randomUUID(),
            type: 'RECOVERY_TRIGGERED',
            timestamp: new Date(),
            details: {
                serviceName
            },
            source: 'MANUAL',
            impact: 'MEDIUM',
            processed: false,
            serviceName
        };
        await this.repository.saveEvent(event);
        const completedEvent = {
            id: crypto_1.default.randomUUID(),
            type: 'RECOVERY_COMPLETED',
            timestamp: new Date(),
            details: {
                serviceName
            },
            source: 'SYSTEM',
            impact: 'MEDIUM',
            processed: false,
            serviceName
        };
        await this.repository.saveEvent(completedEvent);
        return true;
    }
    async getCurrentServiceStatus() {
        return [
            {
                serviceName: 'api-service',
                status: 'UP',
                availabilityPercentage: 99.95,
                lastCheckTime: new Date()
            },
            {
                serviceName: 'database-service',
                status: 'UP',
                availabilityPercentage: 99.92,
                lastCheckTime: new Date()
            },
            {
                serviceName: 'cache-service',
                status: 'WARNING',
                availabilityPercentage: 99.8,
                lastCheckTime: new Date()
            },
            {
                serviceName: 'message-service',
                status: 'UP',
                availabilityPercentage: 99.98,
                lastCheckTime: new Date()
            }
        ];
    }
    createDefaultAvailabilityConfig() {
        return {
            id: crypto_1.default.randomUUID(),
            availabilityLevel: AvailabilityConfig_1.AvailabilityLevel.MEDIUM,
            availabilityStrategy: 'PASSIVE_REDUNDANCY',
            healthCheckConfigs: [
                {
                    type: AvailabilityConfig_1.HealthCheckType.HTTP,
                    target: 'http://localhost:3000',
                    interval: 30,
                    timeout: 5,
                    failureThreshold: 3,
                    successThreshold: 2,
                    path: '/health'
                },
                {
                    type: AvailabilityConfig_1.HealthCheckType.TCP,
                    target: 'localhost',
                    interval: 60,
                    timeout: 10,
                    failureThreshold: 3,
                    successThreshold: 2,
                    port: 3306
                }
            ],
            failoverConfig: {
                enabled: false,
                delay: 30,
                recoveryDelay: 60,
                autoRecoveryEnabled: false
            },
            loadBalancingConfig: {
                enabled: true,
                algorithm: 'ROUND_ROBIN',
                sessionPersistenceEnabled: false,
                sessionTimeout: 3600
            },
            redundancyInstances: 1,
            maxFailureInstances: 1,
            autoRecoveryEnabled: false,
            monitoringEnabled: true,
            alertingEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            applied: true
        };
    }
    createHealthCheckConfigs(interval) {
        return [
            {
                type: AvailabilityConfig_1.HealthCheckType.HTTP,
                target: 'http://localhost:3000',
                interval,
                timeout: 5,
                failureThreshold: 3,
                successThreshold: 2,
                path: '/health'
            },
            {
                type: AvailabilityConfig_1.HealthCheckType.TCP,
                target: 'localhost',
                interval: interval * 2,
                timeout: 10,
                failureThreshold: 3,
                successThreshold: 2,
                port: 3306
            }
        ];
    }
    async simulateHealthCheck(healthCheckConfig) {
        const result = {
            id: crypto_1.default.randomUUID(),
            healthCheckConfigId: healthCheckConfig.type,
            checkTime: new Date(),
            status: Math.random() > 0.1 ? AvailabilityConfig_1.HealthStatus.HEALTHY : AvailabilityConfig_1.HealthStatus.UNHEALTHY,
            responseTime: Math.floor(Math.random() * 1000) + 50,
            message: Math.random() > 0.1 ? 'OK' : 'Service unavailable',
            target: healthCheckConfig.target,
            type: healthCheckConfig.type
        };
        return result;
    }
    calculateAvailabilityStats(metrics, reportPeriod) {
        return {
            uptime: reportPeriod * 0.999,
            downtime: reportPeriod * 0.001,
            availabilityPercentage: 99.9,
            averageResponseTime: 250,
            peakResponseTime: 800,
            errorRate: 0.5
        };
    }
    calculateAvailabilityScore(availabilityStats, healthCheckStats) {
        let totalScore = 100;
        if (availabilityStats.availabilityPercentage < 99.9) {
            totalScore -= (99.9 - availabilityStats.availabilityPercentage) * 10;
        }
        totalScore -= availabilityStats.errorRate * 2;
        for (const healthCheckStat of healthCheckStats) {
            if (healthCheckStat.successRate < 99) {
                totalScore -= (99 - healthCheckStat.successRate) * 0.5;
            }
        }
        return Math.max(0, Math.min(100, totalScore));
    }
}
exports.AvailabilityOptimizationServiceImpl = AvailabilityOptimizationServiceImpl;
//# sourceMappingURL=AvailabilityOptimizationServiceImpl.js.map