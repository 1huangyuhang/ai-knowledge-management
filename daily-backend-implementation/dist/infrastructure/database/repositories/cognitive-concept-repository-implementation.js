"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveConceptRepositoryImpl = void 0;
const cognitive_concept_1 = require("../../../domain/entities/cognitive-concept");
const cognitive_concept_entity_1 = require("../entities/cognitive-concept.entity");
class CognitiveConceptRepositoryImpl {
    cognitiveConceptEntityRepository;
    constructor(cognitiveConceptEntityRepository) {
        this.cognitiveConceptEntityRepository = cognitiveConceptEntityRepository;
    }
    toEntity(concept) {
        const entity = new cognitive_concept_entity_1.CognitiveConceptEntity();
        entity.id = concept.id;
        entity.modelId = concept.modelId;
        entity.semanticIdentity = concept.semanticIdentity;
        entity.abstractionLevel = concept.abstractionLevel;
        entity.confidenceScore = concept.confidenceScore;
        entity.description = concept.description;
        entity.metadata = concept.metadata;
        entity.createdAt = concept.createdAt;
        entity.updatedAt = concept.updatedAt;
        entity.sourceThoughtIds = concept.sourceThoughtIds;
        return entity;
    }
    toDomain(entity) {
        return new cognitive_concept_1.CognitiveConceptImpl(entity.id, entity.semanticIdentity, entity.abstractionLevel, entity.confidenceScore, entity.description, entity.metadata, entity.sourceThoughtIds, entity.createdAt);
    }
    async create(concept) {
        const entity = this.toEntity(concept);
        const savedEntity = await this.cognitiveConceptEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.cognitiveConceptEntityRepository.findOneBy({ id });
        return entity ? this.toDomain(entity) : null;
    }
    async getByModelId(modelId) {
        const entities = await this.cognitiveConceptEntityRepository.findBy({ modelId });
        return entities.map(entity => this.toDomain(entity));
    }
    async getByThoughtId(thoughtId) {
        const entities = await this.cognitiveConceptEntityRepository
            .createQueryBuilder('concept')
            .where('concept.sourceThoughtIds LIKE :thoughtId', { thoughtId: `%${thoughtId}%` })
            .getMany();
        return entities.map(entity => this.toDomain(entity));
    }
    async update(concept) {
        const entity = this.toEntity(concept);
        const savedEntity = await this.cognitiveConceptEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        const result = await this.cognitiveConceptEntityRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
    async deleteByModelId(modelId) {
        const result = await this.cognitiveConceptEntityRepository.delete({ modelId });
        return result.affected ?? 0;
    }
    async existsById(id) {
        const count = await this.cognitiveConceptEntityRepository.countBy({ id });
        return count > 0;
    }
    async createMany(concepts) {
        const entities = concepts.map(concept => this.toEntity(concept));
        const savedEntities = await this.cognitiveConceptEntityRepository.save(entities);
        return savedEntities.map(entity => this.toDomain(entity));
    }
    async updateMany(concepts) {
        const entities = concepts.map(concept => this.toEntity(concept));
        const savedEntities = await this.cognitiveConceptEntityRepository.save(entities);
        return savedEntities.map(entity => this.toDomain(entity));
    }
}
exports.CognitiveConceptRepositoryImpl = CognitiveConceptRepositoryImpl;
//# sourceMappingURL=cognitive-concept-repository-implementation.js.map