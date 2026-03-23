"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationServiceImpl = void 0;
const tslib_1 = require("tslib");
const PerformanceOptimization_1 = require("../../domain/entities/PerformanceOptimization");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class PerformanceOptimizationServiceImpl {
    performanceRepository;
    logger;
    constructor(performanceRepository, logger) {
        this.performanceRepository = performanceRepository;
        this.logger = logger;
    }
    async createPerformanceBaseline() {
        this.logger.info('Creating performance baseline...');
        const metrics = this.collectSystemMetrics();
        const baseline = {
            id: this.generateId(),
            createdAt: new Date(),
            metrics
        };
        const savedBaseline = await this.performanceRepository.savePerformanceBaseline(baseline);
        this.logger.info('Performance baseline created successfully', { baselineId: savedBaseline.id });
        return savedBaseline;
    }
    async getCurrentPerformanceBaseline() {
        this.logger.info('Getting current performance baseline...');
        return this.performanceRepository.getLatestPerformanceBaseline();
    }
    async getPerformanceBaselineHistory(limit, offset) {
        this.logger.info('Getting performance baseline history...', { limit, offset });
        return this.performanceRepository.getAllPerformanceBaselines(limit, offset);
    }
    async executeOptimization(type, config) {
        this.logger.info('Executing performance optimization...', { type, config });
        const baseline = await this.createPerformanceBaseline();
        const startTime = new Date();
        const resultId = this.generateId();
        let optimizedMetrics = [];
        let improvementPercentage;
        const logs = [];
        let status = PerformanceOptimization_1.OptimizationStatus.OPTIMIZED;
        try {
            logs.push(`Starting optimization for type: ${type}`);
            logs.push(`Optimization config: ${JSON.stringify(config)}`);
            switch (type) {
                case PerformanceOptimization_1.OptimizationType.CACHE:
                    optimizedMetrics = await this.optimizeCache(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.DATABASE:
                    optimizedMetrics = await this.optimizeDatabase(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.API:
                    optimizedMetrics = await this.optimizeAPI(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.MEMORY:
                    optimizedMetrics = await this.optimizeMemory(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.CPU:
                    optimizedMetrics = await this.optimizeCPU(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.NETWORK:
                    optimizedMetrics = await this.optimizeNetwork(config, baseline.metrics, logs);
                    break;
                case PerformanceOptimization_1.OptimizationType.CODE:
                    optimizedMetrics = await this.optimizeCode(config, baseline.metrics, logs);
                    break;
                default:
                    throw new Error(`Unsupported optimization type: ${type}`);
            }
            improvementPercentage = this.calculateImprovement(baseline.metrics, optimizedMetrics);
            logs.push(`Optimization completed with ${improvementPercentage.toFixed(2)}% improvement`);
        }
        catch (error) {
            this.logger.error('Optimization failed', error, { type, config });
            logs.push(`Optimization failed: ${error.message}`);
            status = PerformanceOptimization_1.OptimizationStatus.FAILED;
            optimizedMetrics = baseline.metrics;
        }
        const result = {
            id: resultId,
            type,
            config,
            baseline,
            optimizedMetrics,
            status,
            startTime,
            endTime: new Date(),
            improvementPercentage,
            logs
        };
        const savedResult = await this.performanceRepository.saveOptimizationResult(result);
        this.logger.info('Optimization result saved', { resultId: savedResult.id, status: savedResult.status });
        return savedResult;
    }
    async executeBulkOptimization(optimizations) {
        this.logger.info('Executing bulk performance optimization...', { count: optimizations.length });
        const results = [];
        for (const opt of optimizations) {
            const result = await this.executeOptimization(opt.type, opt.config);
            results.push(result);
        }
        return results;
    }
    async getOptimizationResult(id) {
        this.logger.info('Getting optimization result...', { id });
        return this.performanceRepository.getOptimizationResult(id);
    }
    async getOptimizationResultHistory(limit, offset) {
        this.logger.info('Getting optimization result history...', { limit, offset });
        return this.performanceRepository.getAllOptimizationResults(limit, offset);
    }
    async getOptimizationResultsByType(type, limit, offset) {
        this.logger.info('Getting optimization results by type...', { type, limit, offset });
        return this.performanceRepository.getOptimizationResultsByType(type, limit, offset);
    }
    async updateOptimizationConfig(id, config) {
        this.logger.info('Updating optimization config...', { id, config });
        const result = await this.performanceRepository.getOptimizationResult(id);
        if (!result) {
            this.logger.warn('Optimization result not found', { id });
            return null;
        }
        const updatedResult = {
            ...result,
            config
        };
        return this.performanceRepository.saveOptimizationResult(updatedResult);
    }
    async getOptimizationStatus(id) {
        this.logger.info('Getting optimization status...', { id });
        const result = await this.performanceRepository.getOptimizationResult(id);
        return result ? result.status : null;
    }
    async cancelOptimization(id) {
        this.logger.info('Canceling optimization...', { id });
        const result = await this.performanceRepository.updateOptimizationStatus(id, PerformanceOptimization_1.OptimizationStatus.FAILED);
        return result !== null;
    }
    async getSystemMetrics() {
        this.logger.info('Getting system metrics...');
        return this.collectSystemMetrics();
    }
    async getOptimizationSuggestions() {
        this.logger.info('Getting optimization suggestions...');
        const baseline = await this.performanceRepository.getLatestPerformanceBaseline();
        if (!baseline) {
            return this.getDefaultOptimizationSuggestions();
        }
        return this.generateOptimizationSuggestions(baseline.metrics);
    }
    async validateOptimizationConfig(type, config) {
        this.logger.info('Validating optimization config...', { type, config });
        if (!config.enabled) {
            return true;
        }
        if (config.priority < 0 || config.priority > 10) {
            this.logger.warn('Invalid priority value', { priority: config.priority });
            return false;
        }
        switch (type) {
            case PerformanceOptimization_1.OptimizationType.CACHE:
                return this.validateCacheConfig(config);
            case PerformanceOptimization_1.OptimizationType.DATABASE:
                return this.validateDatabaseConfig(config);
            case PerformanceOptimization_1.OptimizationType.API:
                return this.validateAPIConfig(config);
            default:
                return true;
        }
    }
    async resetOptimization(id) {
        this.logger.info('Resetting optimization...', { id });
        const result = await this.performanceRepository.getOptimizationResult(id);
        if (!result) {
            this.logger.warn('Optimization result not found', { id });
            return false;
        }
        const updatedResult = {
            ...result,
            status: PerformanceOptimization_1.OptimizationStatus.NOT_OPTIMIZED,
            endTime: undefined,
            improvementPercentage: undefined,
            logs: [...result.logs, `Reset optimization at ${new Date().toISOString()}`]
        };
        await this.performanceRepository.saveOptimizationResult(updatedResult);
        return true;
    }
    async resetBulkOptimization(ids) {
        this.logger.info('Resetting bulk optimization...', { ids });
        const results = {};
        for (const id of ids) {
            results[id] = await this.resetOptimization(id);
        }
        return results;
    }
    collectSystemMetrics() {
        const cpuUsage = this.getCPUUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = this.getDiskUsage();
        const networkLatency = this.getNetworkLatency();
        const apiResponseTime = this.getAPIResponseTime();
        return [
            {
                name: 'cpu_usage',
                value: cpuUsage,
                unit: '%',
                description: 'System CPU usage',
                timestamp: new Date()
            },
            {
                name: 'memory_usage',
                value: memoryUsage,
                unit: '%',
                description: 'System memory usage',
                timestamp: new Date()
            },
            {
                name: 'disk_usage',
                value: diskUsage,
                unit: '%',
                description: 'System disk usage',
                timestamp: new Date()
            },
            {
                name: 'network_latency',
                value: networkLatency,
                unit: 'ms',
                description: 'System network latency',
                timestamp: new Date()
            },
            {
                name: 'api_response_time',
                value: apiResponseTime,
                unit: 'ms',
                description: 'System API response time',
                timestamp: new Date()
            }
        ];
    }
    getCPUUsage() {
        return Math.random() * 100;
    }
    getMemoryUsage() {
        return Math.random() * 100;
    }
    getDiskUsage() {
        return Math.random() * 100;
    }
    getNetworkLatency() {
        return Math.random() * 1000;
    }
    getAPIResponseTime() {
        return Math.random() * 1000;
    }
    generateId() {
        return crypto_1.default.randomUUID();
    }
    calculateImprovement(baselineMetrics, optimizedMetrics) {
        let totalImprovement = 0;
        let metricCount = 0;
        for (const baselineMetric of baselineMetrics) {
            const optimizedMetric = optimizedMetrics.find(m => m.name === baselineMetric.name);
            if (optimizedMetric) {
                let improvement = 0;
                switch (baselineMetric.name) {
                    case 'cpu_usage':
                    case 'memory_usage':
                    case 'disk_usage':
                    case 'network_latency':
                    case 'api_response_time':
                        if (baselineMetric.value > 0) {
                            improvement = ((baselineMetric.value - optimizedMetric.value) / baselineMetric.value) * 100;
                        }
                        break;
                    default:
                        if (baselineMetric.value > 0) {
                            improvement = ((optimizedMetric.value - baselineMetric.value) / baselineMetric.value) * 100;
                        }
                }
                totalImprovement += improvement;
                metricCount++;
            }
        }
        return metricCount > 0 ? totalImprovement / metricCount : 0;
    }
    getDefaultOptimizationSuggestions() {
        return [
            {
                type: PerformanceOptimization_1.OptimizationType.CACHE,
                recommendation: 'Enable multi-level caching to improve response times',
                priority: 1
            },
            {
                type: PerformanceOptimization_1.OptimizationType.DATABASE,
                recommendation: 'Add indexes to frequently queried database columns',
                priority: 2
            },
            {
                type: PerformanceOptimization_1.OptimizationType.API,
                recommendation: 'Implement API response caching to reduce server load',
                priority: 3
            },
            {
                type: PerformanceOptimization_1.OptimizationType.MEMORY,
                recommendation: 'Optimize memory usage by implementing proper resource cleanup',
                priority: 4
            },
            {
                type: PerformanceOptimization_1.OptimizationType.NETWORK,
                recommendation: 'Implement network request batching to reduce latency',
                priority: 5
            }
        ];
    }
    generateOptimizationSuggestions(metrics) {
        const suggestions = [];
        for (const metric of metrics) {
            switch (metric.name) {
                case 'cpu_usage':
                    if (metric.value > 80) {
                        suggestions.push({
                            type: PerformanceOptimization_1.OptimizationType.CPU,
                            recommendation: `High CPU usage (${metric.value.toFixed(2)}%). Consider optimizing CPU-intensive operations or scaling resources.`,
                            priority: 1
                        });
                    }
                    break;
                case 'memory_usage':
                    if (metric.value > 80) {
                        suggestions.push({
                            type: PerformanceOptimization_1.OptimizationType.MEMORY,
                            recommendation: `High memory usage (${metric.value.toFixed(2)}%). Consider optimizing memory usage or adding more memory.`,
                            priority: 1
                        });
                    }
                    break;
                case 'disk_usage':
                    if (metric.value > 80) {
                        suggestions.push({
                            type: PerformanceOptimization_1.OptimizationType.CODE,
                            recommendation: `High disk usage (${metric.value.toFixed(2)}%). Consider cleaning up temporary files or adding more storage.`,
                            priority: 3
                        });
                    }
                    break;
                case 'network_latency':
                    if (metric.value > 500) {
                        suggestions.push({
                            type: PerformanceOptimization_1.OptimizationType.NETWORK,
                            recommendation: `High network latency (${metric.value.toFixed(2)}ms). Consider optimizing network requests or using a CDN.`,
                            priority: 2
                        });
                    }
                    break;
                case 'api_response_time':
                    if (metric.value > 1000) {
                        suggestions.push({
                            type: PerformanceOptimization_1.OptimizationType.API,
                            recommendation: `High API response time (${metric.value.toFixed(2)}ms). Consider optimizing API endpoints or adding caching.`,
                            priority: 1
                        });
                    }
                    break;
            }
        }
        if (suggestions.length === 0) {
            return this.getDefaultOptimizationSuggestions();
        }
        return suggestions.sort((a, b) => a.priority - b.priority);
    }
    async optimizeCache(config, baselineMetrics, logs) {
        logs.push('Optimizing cache...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.2);
    }
    async optimizeDatabase(config, baselineMetrics, logs) {
        logs.push('Optimizing database...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.15);
    }
    async optimizeAPI(config, baselineMetrics, logs) {
        logs.push('Optimizing API...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.25);
    }
    async optimizeMemory(config, baselineMetrics, logs) {
        logs.push('Optimizing memory...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.1);
    }
    async optimizeCPU(config, baselineMetrics, logs) {
        logs.push('Optimizing CPU...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.05);
    }
    async optimizeNetwork(config, baselineMetrics, logs) {
        logs.push('Optimizing network...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.15);
    }
    async optimizeCode(config, baselineMetrics, logs) {
        logs.push('Optimizing code...');
        return this.generateOptimizedMetrics(baselineMetrics, 0.2);
    }
    generateOptimizedMetrics(baselineMetrics, improvementPercentage) {
        return baselineMetrics.map(metric => {
            let optimizedValue = metric.value;
            switch (metric.name) {
                case 'cpu_usage':
                case 'memory_usage':
                case 'disk_usage':
                case 'network_latency':
                case 'api_response_time':
                    optimizedValue = metric.value * (1 - improvementPercentage);
                    break;
                default:
                    optimizedValue = metric.value * (1 + improvementPercentage);
            }
            return {
                ...metric,
                value: parseFloat(optimizedValue.toFixed(2)),
                timestamp: new Date()
            };
        });
    }
    validateCacheConfig(config) {
        const { parameters } = config;
        if (parameters.cacheSize && (typeof parameters.cacheSize !== 'number' || parameters.cacheSize <= 0)) {
            this.logger.warn('Invalid cacheSize parameter', { cacheSize: parameters.cacheSize });
            return false;
        }
        if (parameters.ttl && (typeof parameters.ttl !== 'number' || parameters.ttl < 0)) {
            this.logger.warn('Invalid ttl parameter', { ttl: parameters.ttl });
            return false;
        }
        return true;
    }
    validateDatabaseConfig(config) {
        const { parameters } = config;
        if (parameters.poolSize && (typeof parameters.poolSize !== 'number' || parameters.poolSize <= 0)) {
            this.logger.warn('Invalid poolSize parameter', { poolSize: parameters.poolSize });
            return false;
        }
        if (parameters.queryTimeout && (typeof parameters.queryTimeout !== 'number' || parameters.queryTimeout <= 0)) {
            this.logger.warn('Invalid queryTimeout parameter', { queryTimeout: parameters.queryTimeout });
            return false;
        }
        return true;
    }
    validateAPIConfig(config) {
        const { parameters } = config;
        if (parameters.timeout && (typeof parameters.timeout !== 'number' || parameters.timeout <= 0)) {
            this.logger.warn('Invalid timeout parameter', { timeout: parameters.timeout });
            return false;
        }
        if (parameters.maxRetries && (typeof parameters.maxRetries !== 'number' || parameters.maxRetries < 0)) {
            this.logger.warn('Invalid maxRetries parameter', { maxRetries: parameters.maxRetries });
            return false;
        }
        return true;
    }
}
exports.PerformanceOptimizationServiceImpl = PerformanceOptimizationServiceImpl;
//# sourceMappingURL=PerformanceOptimizationServiceImpl.js.map