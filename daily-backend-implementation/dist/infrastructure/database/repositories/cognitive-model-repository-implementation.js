"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelRepositoryImpl = void 0;
const cognitive_model_1 = require("../../../domain/entities/cognitive-model");
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_model_entity_1 = require("../entities/cognitive-model.entity");
class CognitiveModelRepositoryImpl {
    cognitiveModelEntityRepository;
    constructor(cognitiveModelEntityRepository) {
        this.cognitiveModelEntityRepository = cognitiveModelEntityRepository;
    }
    toEntity(model) {
        const entity = new cognitive_model_entity_1.CognitiveModelEntity();
        entity.id = model.getId().toString();
        entity.userId = model.getUserId().toString();
        entity.name = model.getName();
        entity.description = model.getDescription();
        entity.isActive = model.getIsActive();
        entity.createdAt = model.getCreatedAt();
        entity.updatedAt = model.getUpdatedAt();
        entity.version = model.getVersion();
        return entity;
    }
    toDomain(entity) {
        return new cognitive_model_1.CognitiveModel({
            id: uuid_1.UUID.fromString(entity.id),
            userId: uuid_1.UUID.fromString(entity.userId),
            name: entity.name,
            description: entity.description,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            version: entity.version
        });
    }
    async create(model) {
        const entity = this.toEntity(model);
        const savedEntity = await this.cognitiveModelEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.cognitiveModelEntityRepository.findOneBy({ id });
        return entity ? this.toDomain(entity) : null;
    }
    async getByUserId(userId) {
        const entities = await this.cognitiveModelEntityRepository.findBy({ userId });
        return entities.map(entity => this.toDomain(entity));
    }
    async update(model) {
        const entity = this.toEntity(model);
        const savedEntity = await this.cognitiveModelEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        const result = await this.cognitiveModelEntityRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
    async existsById(id) {
        const count = await this.cognitiveModelEntityRepository.countBy({ id });
        return count > 0;
    }
    async getActiveModelByUserId(userId) {
        const entity = await this.cognitiveModelEntityRepository.findOneBy({
            userId,
            isActive: true
        });
        return entity ? this.toDomain(entity) : null;
    }
}
exports.CognitiveModelRepositoryImpl = CognitiveModelRepositoryImpl;
//# sourceMappingURL=cognitive-model-repository-implementation.js.map