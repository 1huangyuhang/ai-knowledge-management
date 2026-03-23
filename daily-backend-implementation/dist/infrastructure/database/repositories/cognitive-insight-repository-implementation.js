"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveInsightRepositoryImpl = void 0;
const cognitive_insight_1 = require("../../../domain/entities/cognitive-insight");
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_insight_entity_1 = require("../entities/cognitive-insight.entity");
class CognitiveInsightRepositoryImpl {
    cognitiveInsightEntityRepository;
    constructor(cognitiveInsightEntityRepository) {
        this.cognitiveInsightEntityRepository = cognitiveInsightEntityRepository;
    }
    toEntity(insight) {
        const entity = new cognitive_insight_entity_1.CognitiveInsightEntity();
        entity.id = insight.getId().toString();
        entity.userId = insight.getUserId().toString();
        entity.type = insight.getType();
        entity.isRead = insight.getIsRead();
        entity.content = {
            title: insight.getTitle(),
            description: insight.getDescription()
        };
        entity.confidence = 1.0;
        entity.createdAt = insight.getCreatedAt();
        entity.updatedAt = insight.getUpdatedAt();
        return entity;
    }
    toDomain(entity) {
        return new cognitive_insight_1.CognitiveInsight({
            id: uuid_1.UUID.fromString(entity.id),
            userId: uuid_1.UUID.fromString(entity.userId),
            title: entity.content['title'] || 'Untitled Insight',
            description: entity.content['description'] || '',
            type: entity.type,
            priority: 1,
            isRead: entity.isRead,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        });
    }
    async create(insight) {
        const entity = this.toEntity(insight);
        const savedEntity = await this.cognitiveInsightEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.cognitiveInsightEntityRepository.findOneBy({ id: id.toString() });
        return entity ? this.toDomain(entity) : null;
    }
    async getByUserId(userId) {
        const entities = await this.cognitiveInsightEntityRepository.findBy({
            userId: userId.toString()
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async getUnreadByUserId(userId) {
        const entities = await this.cognitiveInsightEntityRepository.findBy({
            userId: userId.toString(),
            isRead: false
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async update(insight) {
        const entity = this.toEntity(insight);
        const savedEntity = await this.cognitiveInsightEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        const result = await this.cognitiveInsightEntityRepository.delete({ id: id.toString() });
        return (result.affected ?? 0) > 0;
    }
    async deleteMany(ids) {
        const idStrings = ids.map(id => id.toString());
        const result = await this.cognitiveInsightEntityRepository.delete({
            id: {
                $in: idStrings
            }
        });
        return result.affected ?? 0;
    }
    async markAsRead(id) {
        const result = await this.cognitiveInsightEntityRepository.update({ id: id.toString() }, { isRead: true, updatedAt: new Date() });
        return (result.affected ?? 0) > 0;
    }
    async markManyAsRead(ids) {
        const idStrings = ids.map(id => id.toString());
        const result = await this.cognitiveInsightEntityRepository.update({
            id: {
                $in: idStrings
            }
        }, { isRead: true, updatedAt: new Date() });
        return result.affected ?? 0;
    }
    async getByTypeAndUserId(userId, type) {
        const entities = await this.cognitiveInsightEntityRepository.findBy({
            userId: userId.toString(),
            type
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async getRecentByUserId(userId, limit) {
        const entities = await this.cognitiveInsightEntityRepository.find({
            where: { userId: userId.toString() },
            order: { createdAt: 'DESC' },
            take: limit
        });
        return entities.map(entity => this.toDomain(entity));
    }
}
exports.CognitiveInsightRepositoryImpl = CognitiveInsightRepositoryImpl;
//# sourceMappingURL=cognitive-insight-repository-implementation.js.map