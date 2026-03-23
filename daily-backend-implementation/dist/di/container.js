"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.DIContainer = void 0;
exports.configureDI = configureDI;
const repositories_config_1 = require("./repositories.config");
class DIContainer {
    registry = new Map();
    instances = new Map();
    register(key, factory, isSingleton = false) {
        if (isSingleton) {
            this.registry.set(key, () => {
                if (!this.instances.has(key)) {
                    this.instances.set(key, factory());
                }
                return this.instances.get(key);
            });
        }
        else {
            this.registry.set(key, factory);
        }
    }
    resolve(key) {
        const factory = this.registry.get(key);
        if (!factory) {
            throw new Error(`依赖项 "${key}" 未注册`);
        }
        return factory();
    }
    has(key) {
        return this.registry.has(key);
    }
    remove(key) {
        this.registry.delete(key);
        this.instances.delete(key);
    }
    clear() {
        this.registry.clear();
        this.instances.clear();
    }
    getRegisteredKeys() {
        return Array.from(this.registry.keys());
    }
}
exports.DIContainer = DIContainer;
exports.container = new DIContainer();
async function configureDI(app) {
    exports.container.register('FastifyInstance', () => app, true);
    const { PinoLoggerService } = await Promise.resolve().then(() => __importStar(require('../infrastructure/logging/pino-logger.service')));
    exports.container.register('LoggerService', () => new PinoLoggerService(), true);
    const { DefaultErrorHandler } = await Promise.resolve().then(() => __importStar(require('../infrastructure/error/error-handler')));
    exports.container.register('ErrorHandler', () => {
        const logger = exports.container.resolve('LoggerService');
        return new DefaultErrorHandler(logger, process.env['NODE_ENV'] === 'development');
    }, true);
    const { MemoryCacheService } = await Promise.resolve().then(() => __importStar(require('../infrastructure/cache/memory-cache-service')));
    exports.container.register('CacheService', () => new MemoryCacheService(), true);
    const { eventBus } = await Promise.resolve().then(() => __importStar(require('../infrastructure/events/event-bus')));
    exports.container.register('EventBus', () => eventBus, true);
    const { moduleRegistry } = await Promise.resolve().then(() => __importStar(require('../infrastructure/module/ModuleRegistry')));
    exports.container.register('ModuleRegistry', () => moduleRegistry, true);
    const { healthChecker } = await Promise.resolve().then(() => __importStar(require('../infrastructure/health/HealthChecker')));
    exports.container.register('HealthChecker', () => healthChecker, true);
    await (0, repositories_config_1.initializeRepositories)();
    const { initializeEvolutionHistoryDependencies } = await Promise.resolve().then(() => __importStar(require('./evolution-history.config')));
    await initializeEvolutionHistoryDependencies();
    const { initializeInsightGenerationDependencies } = await Promise.resolve().then(() => __importStar(require('./insight-generation.config')));
    await initializeInsightGenerationDependencies();
    const { initializeThemeAnalysisDependencies } = await Promise.resolve().then(() => __importStar(require('./theme-analysis.config')));
    await initializeThemeAnalysisDependencies();
    const { initializeBlindspotDetectionDependencies } = await Promise.resolve().then(() => __importStar(require('./blindspot-detection.config')));
    await initializeBlindspotDetectionDependencies();
    const { initializeGapIdentificationDependencies } = await Promise.resolve().then(() => __importStar(require('./gap-identification.config')));
    await initializeGapIdentificationDependencies();
    const { initializeFeedbackFormattingDependencies } = await Promise.resolve().then(() => __importStar(require('./feedback-formatting.config')));
    await initializeFeedbackFormattingDependencies();
    const { ModuleIntegrationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/integration/ModuleIntegrationService')));
    exports.container.register('ModuleIntegrationService', () => {
        const moduleRegistry = exports.container.resolve('ModuleRegistry');
        const healthChecker = exports.container.resolve('HealthChecker');
        const eventBus = exports.container.resolve('EventBus');
        const logger = exports.container.resolve('LoggerService');
        return new ModuleIntegrationServiceImpl(moduleRegistry, healthChecker, eventBus, logger);
    }, true);
    console.log('Dependency injection container configured successfully');
    const { DocumentParserServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/DocumentParserService')));
    exports.container.register('DocumentParserService', () => new DocumentParserServiceImpl(), true);
    const { OCRServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/OCRService')));
    exports.container.register('OCRService', () => new OCRServiceImpl(), true);
    const { FileProcessorServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/FileProcessorService')));
    exports.container.register('FileProcessorService', () => {
        const documentParserService = exports.container.resolve('DocumentParserService');
        const ocrService = exports.container.resolve('OCRService');
        return new FileProcessorServiceImpl(documentParserService, ocrService);
    }, true);
    const { InputAdapter } = await Promise.resolve().then(() => __importStar(require('../application/adapters/InputAdapter')));
    exports.container.register('InputAdapter', () => new InputAdapter(), true);
    const { InputMerger } = await Promise.resolve().then(() => __importStar(require('../application/services/InputMerger')));
    exports.container.register('InputMerger', () => new InputMerger(), true);
    const { InputPrioritizer } = await Promise.resolve().then(() => __importStar(require('../application/services/InputPrioritizer')));
    exports.container.register('InputPrioritizer', () => new InputPrioritizer(), true);
    const { InputRouter } = await Promise.resolve().then(() => __importStar(require('../application/services/InputRouter')));
    exports.container.register('InputRouter', () => new InputRouter(), true);
    const { InputAnalysisService } = await Promise.resolve().then(() => __importStar(require('../application/services/InputAnalysisService')));
    exports.container.register('InputAnalysisService', () => {
        const analysisRepository = exports.container.resolve('InputAnalysisRepository');
        const inputRepository = exports.container.resolve('InputRepository');
        const llmClient = exports.container.resolve('LLMClient');
        const logger = exports.container.resolve('LoggerService');
        return new InputAnalysisService(analysisRepository, inputRepository, llmClient, logger);
    }, true);
    const { SuggestionGenerationService } = await Promise.resolve().then(() => __importStar(require('../application/services/SuggestionGenerationService')));
    const { SuggestionRepositoryImpl } = await Promise.resolve().then(() => __importStar(require('../infrastructure/database/repositories/SuggestionRepositoryImpl')));
    exports.container.register('SuggestionRepository', () => {
        const dbManager = exports.container.resolve('DatabaseManager');
        return new SuggestionRepositoryImpl(dbManager);
    }, true);
    exports.container.register('SuggestionGenerationService', () => {
        const suggestionRepository = exports.container.resolve('SuggestionRepository');
        const cognitiveModelRepository = exports.container.resolve('CognitiveModelRepository');
        const logger = exports.container.resolve('LoggerService');
        return new SuggestionGenerationService(suggestionRepository, cognitiveModelRepository, logger);
    }, true);
    const { PerformanceOptimizationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/PerformanceOptimizationServiceImpl')));
    exports.container.register('PerformanceOptimizationService', () => {
        const performanceRepository = exports.container.resolve('PerformanceOptimizationRepository');
        const logger = exports.container.resolve('LoggerService');
        return new PerformanceOptimizationServiceImpl(performanceRepository, logger);
    }, true);
    const { SecurityOptimizationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/SecurityOptimizationServiceImpl')));
    exports.container.register('SecurityOptimizationService', () => {
        const securityRepository = exports.container.resolve('SecurityOptimizationRepository');
        return new SecurityOptimizationServiceImpl(securityRepository);
    }, true);
    const { ScalabilityOptimizationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/ScalabilityOptimizationServiceImpl')));
    exports.container.register('ScalabilityOptimizationService', () => {
        const scalabilityRepository = exports.container.resolve('ScalabilityOptimizationRepository');
        return new ScalabilityOptimizationServiceImpl(scalabilityRepository);
    }, true);
    const { AvailabilityOptimizationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/AvailabilityOptimizationServiceImpl')));
    exports.container.register('AvailabilityOptimizationService', () => {
        const availabilityRepository = exports.container.resolve('AvailabilityOptimizationRepository');
        return new AvailabilityOptimizationServiceImpl(availabilityRepository);
    }, true);
    const { MaintainabilityOptimizationServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/MaintainabilityOptimizationServiceImpl')));
    exports.container.register('MaintainabilityOptimizationService', () => {
        const maintainabilityRepository = exports.container.resolve('MaintainabilityOptimizationRepository');
        return new MaintainabilityOptimizationServiceImpl(maintainabilityRepository);
    }, true);
    const { DeploymentServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/DeploymentServiceImpl')));
    exports.container.register('DeploymentService', () => {
        const deploymentRepository = exports.container.resolve('DeploymentRepository');
        return new DeploymentServiceImpl(deploymentRepository);
    }, true);
    const { MonitoringServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/MonitoringServiceImpl')));
    exports.container.register('MonitoringService', () => {
        const monitoringRepository = exports.container.resolve('MonitoringRepository');
        return new MonitoringServiceImpl(monitoringRepository);
    }, true);
    const { PerformanceTestServiceImpl, TestScenarioServiceImpl, TestAnalyzerServiceImpl, ReportGeneratorServiceImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/PerformanceTestServiceImpl')));
    exports.container.register('TestAnalyzerService', () => new TestAnalyzerServiceImpl(), true);
    exports.container.register('ReportGeneratorService', () => new ReportGeneratorServiceImpl(), true);
    exports.container.register('TestScenarioService', () => {
        const testScenarioRepository = exports.container.resolve('TestScenarioRepository');
        return new TestScenarioServiceImpl(testScenarioRepository);
    }, true);
    exports.container.register('PerformanceTestService', () => {
        const performanceTestRepository = exports.container.resolve('PerformanceTestRepository');
        const testScenarioRepository = exports.container.resolve('TestScenarioRepository');
        const testResultRepository = exports.container.resolve('TestResultRepository');
        const performanceReportRepository = exports.container.resolve('PerformanceReportRepository');
        const testAnalyzerService = exports.container.resolve('TestAnalyzerService');
        const reportGeneratorService = exports.container.resolve('ReportGeneratorService');
        return new PerformanceTestServiceImpl(performanceTestRepository, testScenarioRepository, testResultRepository, performanceReportRepository, testAnalyzerService, reportGeneratorService);
    }, true);
    const moduleIntegrationService = exports.container.resolve('ModuleIntegrationService');
    await moduleIntegrationService.integrateModules();
}
//# sourceMappingURL=container.js.map