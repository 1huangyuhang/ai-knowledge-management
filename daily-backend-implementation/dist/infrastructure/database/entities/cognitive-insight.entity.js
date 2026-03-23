"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveInsightEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let CognitiveInsightEntity = class CognitiveInsightEntity {
    id;
    userId;
    user;
    modelId;
    type;
    isRead;
    content;
    confidence;
    createdAt;
    updatedAt;
};
exports.CognitiveInsightEntity = CognitiveInsightEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CognitiveInsightEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    tslib_1.__metadata("design:type", String)
], CognitiveInsightEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", user_entity_1.UserEntity)
], CognitiveInsightEntity.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", Object)
], CognitiveInsightEntity.prototype, "modelId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    tslib_1.__metadata("design:type", String)
], CognitiveInsightEntity.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], CognitiveInsightEntity.prototype, "isRead", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Object)
], CognitiveInsightEntity.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    tslib_1.__metadata("design:type", Number)
], CognitiveInsightEntity.prototype, "confidence", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], CognitiveInsightEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], CognitiveInsightEntity.prototype, "updatedAt", void 0);
exports.CognitiveInsightEntity = CognitiveInsightEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('cognitive_insights')
], CognitiveInsightEntity);
//# sourceMappingURL=cognitive-insight.entity.js.map