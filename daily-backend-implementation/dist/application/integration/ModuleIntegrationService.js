"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleIntegrationServiceImpl = exports.DefaultHealthIndicator = void 0;
const ModuleRegistry_1 = require("../../infrastructure/module/ModuleRegistry");
const HealthChecker_1 = require("../../infrastructure/health/HealthChecker");
const CORE_MODULES = [
    {
        id: 'cognitive-relation',
        name: '认知关系模块',
        version: '1.0.0',
        dependencies: [],
        healthCheckUrl: '/health/cognitive-relation',
        apiEndpoints: ['/api/cognitive-relation/*'],
        status: ModuleRegistry_1.ModuleStatus.INITIALIZING,
        description: '负责处理认知概念和关系的解析与管理'
    },
    {
        id: 'model-evolution',
        name: '模型演化模块',
        version: '1.0.0',
        dependencies: ['cognitive-relation'],
        healthCheckUrl: '/health/model-evolution',
        apiEndpoints: ['/api/model-evolution/*'],
        status: ModuleRegistry_1.ModuleStatus.INITIALIZING,
        description: '负责认知模型的演化历史和版本管理'
    },
    {
        id: 'cognitive-feedback',
        name: '认知反馈模块',
        version: '1.0.0',
        dependencies: ['model-evolution'],
        healthCheckUrl: '/health/cognitive-feedback',
        apiEndpoints: ['/api/cognitive-feedback/*'],
        status: ModuleRegistry_1.ModuleStatus.INITIALIZING,
        description: '负责生成认知洞察、主题分析、盲点检测和差距识别'
    },
    {
        id: 'llm-integration',
        name: 'LLM集成模块',
        version: '1.0.0',
        dependencies: [],
        healthCheckUrl: '/health/llm-integration',
        apiEndpoints: ['/api/llm/*'],
        status: ModuleRegistry_1.ModuleStatus.INITIALIZING,
        description: '负责与大语言模型的集成和交互'
    },
    {
        id: 'embedding-service',
        name: '嵌入向量服务模块',
        version: '1.0.0',
        dependencies: [],
        healthCheckUrl: '/health/embedding-service',
        apiEndpoints: ['/api/embedding/*'],
        status: ModuleRegistry_1.ModuleStatus.INITIALIZING,
        description: '负责处理文本嵌入向量的生成和管理'
    }
];
class DefaultHealthIndicator {
    moduleId;
    logger;
    constructor(moduleId, logger) {
        this.moduleId = moduleId;
        this.logger = logger;
    }
    async check() {
        try {
            return {
                status: HealthChecker_1.HealthStatusType.UP,
                details: {
                    moduleId: this.moduleId,
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            this.logger.error(`Health check failed for module ${this.moduleId}: ${error instanceof Error ? error.message : String(error)}`);
            return {
                status: HealthChecker_1.HealthStatusType.DOWN,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
exports.DefaultHealthIndicator = DefaultHealthIndicator;
class ModuleIntegrationServiceImpl {
    moduleRegistry;
    healthChecker;
    eventBus;
    logger;
    constructor(moduleRegistry, healthChecker, eventBus, logger) {
        this.moduleRegistry = moduleRegistry;
        this.healthChecker = healthChecker;
        this.eventBus = eventBus;
        this.logger = logger;
    }
    async integrateModules() {
        this.logger.info('开始执行模块集成...');
        for (const moduleInfo of CORE_MODULES) {
            await this.registerModule(moduleInfo);
        }
        for (const module of CORE_MODULES) {
            const healthIndicator = new DefaultHealthIndicator(module.id, this.logger);
            await this.registerHealthIndicator(healthIndicator);
        }
        for (const module of CORE_MODULES) {
            await this.moduleRegistry.updateModuleStatus(module.id, ModuleRegistry_1.ModuleStatus.RUNNING);
        }
        this.logger.info('模块集成完成，所有核心模块已注册并初始化');
        await this.eventBus.publish({
            type: 'MODULE_INTEGRATION_COMPLETED',
            timestamp: Date.now(),
            source: 'ModuleIntegrationService',
            data: {
                modules: await this.moduleRegistry.getAllModules(),
                timestamp: Date.now()
            }
        });
    }
    async registerModule(moduleInfo) {
        this.logger.info(`注册模块: ${moduleInfo.name} (${moduleInfo.id})`);
        await this.moduleRegistry.registerModule(moduleInfo);
        this.logger.info(`模块 ${moduleInfo.id} 注册成功`);
    }
    async registerHealthIndicator(indicator) {
        this.logger.info(`注册健康指示器: ${indicator.moduleId}`);
        await this.healthChecker.registerHealthIndicator(indicator);
        this.logger.info(`健康指示器 ${indicator.moduleId} 注册成功`);
    }
    async getIntegrationStatus() {
        const modules = await this.moduleRegistry.getAllModules();
        const healthStatus = await this.healthChecker.checkHealth();
        return {
            modules,
            healthStatus,
            timestamp: Date.now()
        };
    }
}
exports.ModuleIntegrationServiceImpl = ModuleIntegrationServiceImpl;
//# sourceMappingURL=ModuleIntegrationService.js.map