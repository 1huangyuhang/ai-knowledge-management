"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtFragmentRepositoryImpl = void 0;
const typeorm_1 = require("typeorm");
const thought_fragment_1 = require("../../../domain/entities/thought-fragment");
const thought_fragment_entity_1 = require("../entities/thought-fragment.entity");
class ThoughtFragmentRepositoryImpl {
    thoughtFragmentEntityRepository;
    constructor(thoughtFragmentEntityRepository) {
        this.thoughtFragmentEntityRepository = thoughtFragmentEntityRepository;
    }
    toEntity(fragment) {
        const entity = new thought_fragment_entity_1.ThoughtFragmentEntity();
        entity.id = fragment.id;
        entity.userId = fragment.userId;
        entity.content = fragment.content;
        entity.source = fragment.metadata?.['source'] || 'manual';
        entity.isProcessed = fragment.isProcessed;
        entity.createdAt = fragment.createdAt;
        entity.updatedAt = fragment.updatedAt || new Date();
        return entity;
    }
    toDomain(entity) {
        return new thought_fragment_1.ThoughtFragmentImpl(entity.id, entity.content, entity.userId, { source: entity.source }, entity.isProcessed, 0, null, entity.createdAt);
    }
    async create(fragment) {
        const entity = this.toEntity(fragment);
        const savedEntity = await this.thoughtFragmentEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.thoughtFragmentEntityRepository.findOneBy({ id: id.toString() });
        return entity ? this.toDomain(entity) : null;
    }
    async getByUserId(userId) {
        const entities = await this.thoughtFragmentEntityRepository.findBy({
            userId: userId.toString()
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async getUnprocessedByUserId(userId) {
        const entities = await this.thoughtFragmentEntityRepository.findBy({
            userId: userId.toString(),
            isProcessed: false
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async getByIds(ids) {
        const idStrings = ids.map(id => id.toString());
        const entities = await this.thoughtFragmentEntityRepository.findBy({
            id: (0, typeorm_1.In)(idStrings)
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async update(fragment) {
        const entity = this.toEntity(fragment);
        const savedEntity = await this.thoughtFragmentEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        const result = await this.thoughtFragmentEntityRepository.delete({ id: id.toString() });
        return (result.affected ?? 0) > 0;
    }
    async deleteMany(ids) {
        const idStrings = ids.map(id => id.toString());
        const result = await this.thoughtFragmentEntityRepository.delete({
            id: (0, typeorm_1.In)(idStrings)
        });
        return result.affected ?? 0;
    }
    async markAsProcessed(id) {
        const result = await this.thoughtFragmentEntityRepository.update({ id: id.toString() }, { isProcessed: true, updatedAt: new Date() });
        return (result.affected ?? 0) > 0;
    }
    async markManyAsProcessed(ids) {
        const idStrings = ids.map(id => id.toString());
        const result = await this.thoughtFragmentEntityRepository.update({
            id: (0, typeorm_1.In)(idStrings)
        }, { isProcessed: true, updatedAt: new Date() });
        return result.affected ?? 0;
    }
}
exports.ThoughtFragmentRepositoryImpl = ThoughtFragmentRepositoryImpl;
//# sourceMappingURL=thought-fragment-repository-implementation.js.map