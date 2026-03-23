"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const AITask_1 = require("../../../domain/entities/AITask");
let AITaskEntity = class AITaskEntity {
    id;
    type;
    priority;
    status;
    inputData;
    result;
    error;
    retryCount;
    maxRetries;
    createdAt;
    updatedAt;
    startedAt;
    completedAt;
    estimatedExecutionTime;
    actualExecutionTime;
    userId;
    cognitiveModelId;
    dependsOn;
};
exports.AITaskEntity = AITaskEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], AITaskEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    tslib_1.__metadata("design:type", String)
], AITaskEntity.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    tslib_1.__metadata("design:type", String)
], AITaskEntity.prototype, "priority", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    tslib_1.__metadata("design:type", String)
], AITaskEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "inputData", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "result", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "error", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    tslib_1.__metadata("design:type", Number)
], AITaskEntity.prototype, "retryCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('int', { default: 3 }),
    tslib_1.__metadata("design:type", Number)
], AITaskEntity.prototype, "maxRetries", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], AITaskEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], AITaskEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "startedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "completedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "estimatedExecutionTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "actualExecutionTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], AITaskEntity.prototype, "cognitiveModelId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json', { default: '[]' }),
    tslib_1.__metadata("design:type", Array)
], AITaskEntity.prototype, "dependsOn", void 0);
exports.AITaskEntity = AITaskEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('ai_tasks'),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['cognitiveModelId']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['updatedAt'])
], AITaskEntity);
//# sourceMappingURL=ai-task.entity.js.map