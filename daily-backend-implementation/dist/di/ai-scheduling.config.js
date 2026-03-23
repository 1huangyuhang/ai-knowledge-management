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
exports.initializeAISchedulingDependencies = initializeAISchedulingDependencies;
const container_1 = require("./container");
async function initializeAISchedulingDependencies() {
    const { ResourceRepositoryImpl } = await Promise.resolve().then(() => __importStar(require('../infrastructure/repositories/ResourceRepositoryImpl')));
    container_1.container.register('ResourceRepository', () => {
        const dbClient = container_1.container.resolve('DatabaseClient');
        const logger = container_1.container.resolve('LoggerService');
        return new ResourceRepositoryImpl(dbClient, logger);
    }, true);
    const { ResourceManagerImpl } = await Promise.resolve().then(() => __importStar(require('../application/services/ResourceManager')));
    container_1.container.register('ResourceManager', () => {
        const resourceRepository = container_1.container.resolve('ResourceRepository');
        const logger = container_1.container.resolve('LoggerService');
        return new ResourceManagerImpl(resourceRepository, logger);
    }, true);
    const { AITaskQueue } = await Promise.resolve().then(() => __importStar(require('../application/services/ai-task-queue')));
    container_1.container.register('AITaskQueue', () => new AITaskQueue(), true);
    const { AITaskExecutor } = await Promise.resolve().then(() => __importStar(require('../application/services/ai-task-executor')));
    container_1.container.register('AITaskExecutor', () => new AITaskExecutor(), true);
    const { AITaskMonitor } = await Promise.resolve().then(() => __importStar(require('../application/services/ai-task-monitor')));
    container_1.container.register('AITaskMonitor', () => new AITaskMonitor(), true);
    const { AIScheduler } = await Promise.resolve().then(() => __importStar(require('../application/services/ai-scheduler')));
    container_1.container.register('AIScheduler', () => {
        const taskQueue = container_1.container.resolve('AITaskQueue');
        const taskExecutor = container_1.container.resolve('AITaskExecutor');
        const taskMonitor = container_1.container.resolve('AITaskMonitor');
        const taskRepository = container_1.container.resolve('AITaskRepository');
        const resourceManager = container_1.container.resolve('ResourceManager');
        return new AIScheduler(taskQueue, taskExecutor, taskMonitor, taskRepository, resourceManager);
    }, true);
}
//# sourceMappingURL=ai-scheduling.config.js.map