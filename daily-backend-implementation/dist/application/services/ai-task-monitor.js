"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskMonitor = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let AITaskMonitor = class AITaskMonitor {
    taskTimers = new Map();
    MAX_EXECUTION_TIME = 300000;
    MAX_RETRIES = 3;
    monitorTask(task) {
        const timer = setTimeout(() => {
            this.onTaskTimeout(task);
        }, this.MAX_EXECUTION_TIME);
        this.taskTimers.set(task.id, timer);
    }
    onTaskComplete(task) {
        this.clearTaskTimer(task.id);
        console.log(`Task completed: ${task.id}`);
    }
    onTaskFailed(task) {
        this.clearTaskTimer(task.id);
        console.error(`Task failed: ${task.id}, Error: ${task.error}`);
    }
    onTaskTimeout(task) {
        this.clearTaskTimer(task.id);
        console.error(`Task timed out: ${task.id}`);
    }
    canRetry(task) {
        if (!task.retries) {
            task.retries = 0;
        }
        return task.retries < this.MAX_RETRIES;
    }
    clearTaskTimer(taskId) {
        const timer = this.taskTimers.get(taskId);
        if (timer) {
            clearTimeout(timer);
            this.taskTimers.delete(taskId);
        }
    }
};
exports.AITaskMonitor = AITaskMonitor;
exports.AITaskMonitor = AITaskMonitor = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], AITaskMonitor);
//# sourceMappingURL=ai-task-monitor.js.map