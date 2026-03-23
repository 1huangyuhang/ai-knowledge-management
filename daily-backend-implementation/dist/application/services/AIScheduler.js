"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIScheduler = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const AITaskQueue_1 = require("./AITaskQueue");
const AITaskExecutor_1 = require("./AITaskExecutor");
const AITaskMonitor_1 = require("./AITaskMonitor");
const AITaskRepository_1 = require("../../infrastructure/repositories/AITaskRepository");
let AIScheduler = class AIScheduler {
    taskQueue;
    taskExecutor;
    taskMonitor;
    taskRepository;
    constructor(taskQueue, taskExecutor, taskMonitor, taskRepository) {
        this.taskQueue = taskQueue;
        this.taskExecutor = taskExecutor;
        this.taskMonitor = taskMonitor;
        this.taskRepository = taskRepository;
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
        task.cancel();
        const cancelledTask = await this.taskRepository.save(task);
        this.taskQueue.remove(taskId);
        return cancelledTask;
    }
    async processTaskQueue() {
        const task = this.taskQueue.dequeue();
        if (!task) {
            return;
        }
        task.start();
        await this.taskRepository.save(task);
        this.taskMonitor.monitorTask(task);
        try {
            const result = await this.taskExecutor.executeTask(task);
            task.succeed(result);
            await this.taskRepository.save(task);
            this.taskMonitor.onTaskComplete(task);
        }
        catch (error) {
            task.fail(error.message);
            await this.taskRepository.save(task);
            this.taskMonitor.onTaskFailed(task);
        }
        this.processTaskQueue();
    }
};
exports.AIScheduler = AIScheduler;
exports.AIScheduler = AIScheduler = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(AITaskQueue_1.AITaskQueue)),
    tslib_1.__param(1, (0, inversify_1.inject)(AITaskExecutor_1.AITaskExecutor)),
    tslib_1.__param(2, (0, inversify_1.inject)(AITaskMonitor_1.AITaskMonitor)),
    tslib_1.__param(3, (0, inversify_1.inject)(AITaskRepository_1.AITaskRepository)),
    tslib_1.__metadata("design:paramtypes", [AITaskQueue_1.AITaskQueue,
        AITaskExecutor_1.AITaskExecutor,
        AITaskMonitor_1.AITaskMonitor, typeof (_a = typeof AITaskRepository_1.AITaskRepository !== "undefined" && AITaskRepository_1.AITaskRepository) === "function" ? _a : Object])
], AIScheduler);
//# sourceMappingURL=AIScheduler.js.map