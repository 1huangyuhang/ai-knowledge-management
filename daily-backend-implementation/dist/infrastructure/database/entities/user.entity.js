"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const user_role_enum_1 = require("../../../domain/enums/user-role.enum");
let UserEntity = class UserEntity {
    id;
    email;
    password;
    role;
    firstName;
    lastName;
    isActive;
    createdAt;
    updatedAt;
};
exports.UserEntity = UserEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, length: 255 }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: user_role_enum_1.UserRole.USER }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], UserEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], UserEntity.prototype, "updatedAt", void 0);
exports.UserEntity = UserEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users')
], UserEntity);
//# sourceMappingURL=user.entity.js.map