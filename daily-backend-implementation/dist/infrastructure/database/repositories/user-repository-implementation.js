"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
const user_1 = require("../../../domain/entities/user");
const user_entity_1 = require("../entities/user.entity");
class UserRepositoryImpl {
    userEntityRepository;
    constructor(userEntityRepository) {
        this.userEntityRepository = userEntityRepository;
    }
    toEntity(user) {
        const entity = new user_entity_1.UserEntity();
        entity.id = user.id;
        entity.email = user.email;
        entity.password = user.passwordHash;
        entity.role = user.role;
        entity.firstName = user.username.split(' ')[0] || 'User';
        entity.lastName = user.username.split(' ')[1] || '';
        entity.isActive = user.isActive;
        entity.createdAt = user.createdAt;
        entity.updatedAt = user.updatedAt;
        return entity;
    }
    toDomain(entity) {
        return new user_1.UserImpl(entity.id, `${entity.firstName} ${entity.lastName}`.trim() || 'User', entity.email, entity.password, entity.role, entity.createdAt);
    }
    async create(user) {
        const entity = this.toEntity(user);
        const savedEntity = await this.userEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.userEntityRepository.findOneBy({ id });
        return entity ? this.toDomain(entity) : null;
    }
    async getByEmail(email) {
        const entity = await this.userEntityRepository.findOneBy({ email });
        return entity ? this.toDomain(entity) : null;
    }
    async update(user) {
        const entity = this.toEntity(user);
        const savedEntity = await this.userEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        const result = await this.userEntityRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
    async getAll() {
        const entities = await this.userEntityRepository.find();
        return entities.map(entity => this.toDomain(entity));
    }
    async existsByEmail(email) {
        const count = await this.userEntityRepository.countBy({ email });
        return count > 0;
    }
}
exports.UserRepositoryImpl = UserRepositoryImpl;
//# sourceMappingURL=user-repository-implementation.js.map