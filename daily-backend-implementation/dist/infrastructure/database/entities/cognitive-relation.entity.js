"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveRelationEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const cognitive_model_entity_1 = require("./cognitive-model.entity");
const cognitive_concept_entity_1 = require("./cognitive-concept.entity");
let CognitiveRelationEntity = class CognitiveRelationEntity {
    id;
    modelId;
    model;
    sourceConceptId;
    sourceConcept;
    targetConceptId;
    targetConcept;
    type;
    confidenceScore;
    description;
    metadata;
    createdAt;
    updatedAt;
    sourceThoughtIds;
};
exports.CognitiveRelationEntity = CognitiveRelationEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "modelId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => cognitive_model_entity_1.CognitiveModelEntity, (model) => model.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'modelId' }),
    tslib_1.__metadata("design:type", cognitive_model_entity_1.CognitiveModelEntity)
], CognitiveRelationEntity.prototype, "model", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "sourceConceptId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => cognitive_concept_entity_1.CognitiveConceptEntity, (concept) => concept.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sourceConceptId' }),
    tslib_1.__metadata("design:type", cognitive_concept_entity_1.CognitiveConceptEntity)
], CognitiveRelationEntity.prototype, "sourceConcept", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "targetConceptId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => cognitive_concept_entity_1.CognitiveConceptEntity, (concept) => concept.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'targetConceptId' }),
    tslib_1.__metadata("design:type", cognitive_concept_entity_1.CognitiveConceptEntity)
], CognitiveRelationEntity.prototype, "targetConcept", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, index: true }),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, index: true }),
    tslib_1.__metadata("design:type", Number)
], CognitiveRelationEntity.prototype, "confidenceScore", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Object)
], CognitiveRelationEntity.prototype, "metadata", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ index: true }),
    tslib_1.__metadata("design:type", Date)
], CognitiveRelationEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], CognitiveRelationEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    tslib_1.__metadata("design:type", String)
], CognitiveRelationEntity.prototype, "sourceThoughtIds", void 0);
exports.CognitiveRelationEntity = CognitiveRelationEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('cognitive_relations'),
    (0, typeorm_1.Index)(['modelId', 'sourceConceptId']),
    (0, typeorm_1.Index)(['modelId', 'targetConceptId']),
    (0, typeorm_1.Index)(['sourceConceptId', 'targetConceptId'])
], CognitiveRelationEntity);
//# sourceMappingURL=cognitive-relation.entity.js.map