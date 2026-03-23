"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIScheduler = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const ai_task_queue_1 = require("./ai-task-queue");
const ai_task_executor_1 = require("./ai-task-executor");
const ai_task_monitor_1 = require("./ai-task-monitor");
const ai_task_repository_1 = require("../../domain/repositories/ai-task-repository");
const Resource_1 = require("../../domain/entities/Resource");
let AIScheduler = class AIScheduler {
    taskQueue;
    taskExecutor;
    taskMonitor;
    taskRepository;
    resourceManager;
    constructor(taskQueue, taskExecutor, taskMonitor, taskRepository, resourceManager) {
        this.taskQueue = taskQueue;
        this.taskExecutor = taskExecutor;
        this.taskMonitor = taskMonitor;
        this.taskRepository = taskRepository;
        this.resourceManager = resourceManager;
    }
    async scheduleTask(task) {
        const savedTask = await this.taskRepository.save(task);
        this.taskQueue.enqueue(savedTask);
        this.processTaskQueue();
        return savedTask;
    }
    async rescheduleTask(taskId, newPriority) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new Error(`任务不存在: ${taskId}`);
        }
        task.priority = newPriority;
        task.updatedAt = new Date();
        const updatedTask = await this.taskRepository.save(task);
        if (task.status === 'PENDING') {
            this.taskQueue.remove(taskId);
            this.taskQueue.enqueue(updatedTask);
        }
        return updatedTask;
    }
    async cancelTask(taskId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new Error(`任务不存在: ${taskId}`);
        }
        task.status = 'CANCELLED';
        task.updatedAt = new Date();
        const cancelledTask = await this.taskRepository.save(task);
        this.taskQueue.remove(taskId);
        return cancelledTask;
    }
    async processTaskQueue() {
        const task = this.taskQueue.dequeue();
        if (!task) {
            return;
        }
        const resourceType = this.getResourceTypeForTask(task);
        let allocatedResource = null;
        try {
            allocatedResource = await this.resourceManager.allocateResource(resourceType, 1);
            if (!allocatedResource) {
                task.status = 'PENDING';
                task.updatedAt = new Date();
                task.error = '资源不足，任务等待中';
                await this.taskRepository.save(task);
                this.taskQueue.enqueue(task);
                return;
            }
            task.status = 'RUNNING';
            task.updatedAt = new Date();
            task.metadata = {
                ...task.metadata,
                allocatedResourceId: allocatedResource.id.value,
                allocatedResourceName: allocatedResource.name
            };
            await this.taskRepository.save(task);
            this.taskMonitor.monitorTask(task);
            const result = await this.taskExecutor.executeTask(task);
            task.status = 'SUCCESS';
            task.result = result;
            task.completedAt = new Date();
            await this.taskRepository.save(task);
            this.taskMonitor.onTaskComplete(task);
        }
        catch (error) {
            task.status = 'FAILED';
            task.error = error.message;
            task.completedAt = new Date();
            await this.taskRepository.save(task);
            this.taskMonitor.onTaskFailed(task);
        }
        finally {
            if (allocatedResource) {
                await this.resourceManager.releaseResource(allocatedResource.id, 1);
            }
        }
        this.processTaskQueue();
    }
    getResourceTypeForTask(task) {
        switch (task.type) {
            case 'FILE_PROCESSING':
                return Resource_1.ResourceType.FILE_PROCESSING;
            case 'SPEECH_PROCESSING':
                return Resource_1.ResourceType.SPEECH_PROCESSING;
            case 'COGNITIVE_ANALYSIS':
                return Resource_1.ResourceType.LLM;
            case 'EMBEDDING_GENERATION':
                return Resource_1.ResourceType.EMBEDDING;
            default:
                return Resource_1.ResourceType.LLM;
        }
    }
};
exports.AIScheduler = AIScheduler;
exports.AIScheduler = AIScheduler = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(ai_task_queue_1.AITaskQueue)),
    tslib_1.__param(1, (0, inversify_1.inject)(ai_task_executor_1.AITaskExecutor)),
    tslib_1.__param(2, (0, inversify_1.inject)(ai_task_monitor_1.AITaskMonitor)),
    tslib_1.__param(3, (0, inversify_1.inject)(ai_task_repository_1.AITaskRepository)),
    tslib_1.__param(4, (0, inversify_1.inject)(ResourceManager_1.ResourceManager)),
    tslib_1.__metadata("design:paramtypes", [ai_task_queue_1.AITaskQueue,
        ai_task_executor_1.AITaskExecutor,
        ai_task_monitor_1.AITaskMonitor, typeof (_a = typeof ai_task_repository_1.AITaskRepository !== "undefined" && ai_task_repository_1.AITaskRepository) === "function" ? _a : Object, Object])
], AIScheduler);
//# sourceMappingURL=ai-scheduler.js.map