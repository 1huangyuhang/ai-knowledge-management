"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtFragmentEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let ThoughtFragmentEntity = class ThoughtFragmentEntity {
    id;
    userId;
    user;
    content;
    source;
    isProcessed;
    createdAt;
    updatedAt;
};
exports.ThoughtFragmentEntity = ThoughtFragmentEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ThoughtFragmentEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    tslib_1.__metadata("design:type", String)
], ThoughtFragmentEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", user_entity_1.UserEntity)
], ThoughtFragmentEntity.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], ThoughtFragmentEntity.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'manual' }),
    tslib_1.__metadata("design:type", String)
], ThoughtFragmentEntity.prototype, "source", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ThoughtFragmentEntity.prototype, "isProcessed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], ThoughtFragmentEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], ThoughtFragmentEntity.prototype, "updatedAt", void 0);
exports.ThoughtFragmentEntity = ThoughtFragmentEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('thought_fragments')
], ThoughtFragmentEntity);
//# sourceMappingURL=thought-fragment.entity.js.map