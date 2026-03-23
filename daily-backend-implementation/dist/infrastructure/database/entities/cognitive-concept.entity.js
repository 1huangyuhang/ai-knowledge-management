"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveConceptEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const cognitive_model_entity_1 = require("./cognitive-model.entity");
let CognitiveConceptEntity = class CognitiveConceptEntity {
    id;
    modelId;
    model;
    semanticIdentity;
    abstractionLevel;
    confidenceScore;
    description;
    metadata;
    createdAt;
    updatedAt;
    sourceThoughtIds;
};
exports.CognitiveConceptEntity = CognitiveConceptEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CognitiveConceptEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CognitiveConceptEntity.prototype, "modelId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => cognitive_model_entity_1.CognitiveModelEntity, (model) => model.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'modelId' }),
    tslib_1.__metadata("design:type", cognitive_model_entity_1.CognitiveModelEntity)
], CognitiveConceptEntity.prototype, "model", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CognitiveConceptEntity.prototype, "semanticIdentity", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", Number)
], CognitiveConceptEntity.prototype, "abstractionLevel", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", Number)
], CognitiveConceptEntity.prototype, "confidenceScore", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], CognitiveConceptEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Object)
], CognitiveConceptEntity.prototype, "metadata", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ index: true }),
    tslib_1.__metadata("design:type", Date)
], CognitiveConceptEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], CognitiveConceptEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    tslib_1.__metadata("design:type", String)
], CognitiveConceptEntity.prototype, "sourceThoughtIds", void 0);
exports.CognitiveConceptEntity = CognitiveConceptEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('cognitive_concepts'),
    (0, typeorm_1.Index)(['modelId', 'semanticIdentity']),
    (0, typeorm_1.Index)(['modelId', 'abstractionLevel']),
    (0, typeorm_1.Index)(['modelId', 'confidenceScore'])
], CognitiveConceptEntity);
//# sourceMappingURL=cognitive-concept.entity.js.map