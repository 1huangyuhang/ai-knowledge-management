"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskMonitor = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let AITaskMonitor = class AITaskMonitor {
    maxRetries = 3;
    taskTimeouts = new Map();
    taskRetryCounts = new Map();
    timeoutDuration = 300000;
    monitorTask(task) {
        const timeoutId = setTimeout(() => {
            this.onTaskTimeout(task);
        }, this.timeoutDuration);
        this.taskTimeouts.set(task.id, timeoutId);
    }
    onTaskComplete(task) {
        this.clearTaskMonitoring(task.id);
        console.log(`任务完成: ${task.id} - ${task.type}`);
    }
    onTaskFailed(task) {
        this.clearTaskMonitoring(task.id);
        console.error(`任务失败: ${task.id} - ${task.type} - ${task.error}`);
        this.retryTask(task).catch(error => {
            console.error(`任务重试失败: ${task.id} - ${error.message}`);
        });
    }
    onTaskTimeout(task) {
        this.clearTaskMonitoring(task.id);
        console.error(`任务超时: ${task.id} - ${task.type}`);
        this.retryTask(task).catch(error => {
            console.error(`任务超时后重试失败: ${task.id} - ${error.message}`);
        });
    }
    async retryTask(task) {
        const retryCount = this.taskRetryCounts.get(task.id) || 0;
        if (retryCount >= this.maxRetries) {
            console.error(`任务达到最大重试次数: ${task.id} - ${task.type}`);
            return false;
        }
        this.taskRetryCounts.set(task.id, retryCount + 1);
        console.log(`任务重试: ${task.id} - ${task.type} (第${retryCount + 1}次)`);
        return true;
    }
    clearTaskMonitoring(taskId) {
        const timeoutId = this.taskTimeouts.get(taskId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.taskTimeouts.delete(taskId);
        }
        this.taskRetryCounts.delete(taskId);
    }
};
exports.AITaskMonitor = AITaskMonitor;
exports.AITaskMonitor = AITaskMonitor = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], AITaskMonitor);
//# sourceMappingURL=AITaskMonitor.js.map