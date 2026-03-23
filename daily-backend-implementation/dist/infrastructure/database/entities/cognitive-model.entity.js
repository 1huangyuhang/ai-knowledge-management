"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let CognitiveModelEntity = class CognitiveModelEntity {
    id;
    userId;
    user;
    name;
    description;
    isActive;
    createdAt;
    updatedAt;
    version;
};
exports.CognitiveModelEntity = CognitiveModelEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CognitiveModelEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', index: true }),
    tslib_1.__metadata("design:type", String)
], CognitiveModelEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", user_entity_1.UserEntity)
], CognitiveModelEntity.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], CognitiveModelEntity.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], CognitiveModelEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, index: true }),
    tslib_1.__metadata("design:type", Boolean)
], CognitiveModelEntity.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ index: true }),
    tslib_1.__metadata("design:type", Date)
], CognitiveModelEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], CognitiveModelEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 1 }),
    tslib_1.__metadata("design:type", Number)
], CognitiveModelEntity.prototype, "version", void 0);
exports.CognitiveModelEntity = CognitiveModelEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('cognitive_models'),
    (0, typeorm_1.Index)(['userId', 'isActive'])
], CognitiveModelEntity);
//# sourceMappingURL=cognitive-model.entity.js.map