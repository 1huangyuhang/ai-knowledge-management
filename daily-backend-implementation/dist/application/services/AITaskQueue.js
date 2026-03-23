"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskQueue = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let AITaskQueue = class AITaskQueue {
    queue = [];
    priorityOrder = {
        'URGENT': 0,
        'HIGH': 1,
        'MEDIUM': 2,
        'LOW': 3
    };
    enqueue(task) {
        this.queue.push(task);
        this.sortQueue();
    }
    dequeue() {
        return this.queue.shift();
    }
    peek() {
        return this.queue[0];
    }
    remove(taskId) {
        const index = this.queue.findIndex(task => task.id === taskId);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
    size() {
        return this.queue.length;
    }
    clear() {
        this.queue.length = 0;
    }
    sortQueue() {
        this.queue.sort((a, b) => {
            const priorityCompare = this.priorityOrder[a.priority] - this.priorityOrder[b.priority];
            if (priorityCompare !== 0) {
                return priorityCompare;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }
};
exports.AITaskQueue = AITaskQueue;
exports.AITaskQueue = AITaskQueue = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], AITaskQueue);
//# sourceMappingURL=AITaskQueue.js.map