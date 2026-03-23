"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskRepositoryImpl = void 0;
const AITask_1 = require("../../../domain/entities/AITask");
const ai_task_entity_1 = require("../entities/ai-task.entity");
const UUID_1 = require("../../../domain/value-objects/UUID");
const AITask_2 = require("../../../domain/entities/AITask");
class AITaskRepositoryImpl {
    aiTaskEntityRepository;
    constructor(aiTaskEntityRepository) {
        this.aiTaskEntityRepository = aiTaskEntityRepository;
    }
    toEntity(task) {
        const entity = new ai_task_entity_1.AITaskEntity();
        entity.id = task.id.toString();
        entity.type = task.type;
        entity.priority = task.priority;
        entity.status = task.status;
        entity.inputData = task.inputData;
        entity.result = task.result;
        entity.error = task.error;
        entity.retryCount = task.retryCount;
        entity.maxRetries = task.maxRetries;
        entity.createdAt = task.createdAt;
        entity.updatedAt = task.updatedAt;
        entity.startedAt = task.startedAt;
        entity.completedAt = task.completedAt;
        entity.estimatedExecutionTime = task.estimatedExecutionTime;
        entity.actualExecutionTime = task.actualExecutionTime;
        entity.userId = task.userId?.toString() || null;
        entity.cognitiveModelId = task.cognitiveModelId?.toString() || null;
        entity.dependsOn = task.dependsOn.map(id => id.toString());
        return entity;
    }
    toDomain(entity) {
        return new AITask_1.AITask({
            id: UUID_1.UUID.fromString(entity.id),
            type: entity.type,
            priority: entity.priority,
            status: entity.status,
            inputData: entity.inputData,
            result: entity.result,
            error: entity.error,
            retryCount: entity.retryCount,
            maxRetries: entity.maxRetries,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            startedAt: entity.startedAt,
            completedAt: entity.completedAt,
            estimatedExecutionTime: entity.estimatedExecutionTime,
            actualExecutionTime: entity.actualExecutionTime,
            userId: entity.userId ? UUID_1.UUID.fromString(entity.userId) : null,
            cognitiveModelId: entity.cognitiveModelId ? UUID_1.UUID.fromString(entity.cognitiveModelId) : null,
            dependsOn: entity.dependsOn.map(id => UUID_1.UUID.fromString(id))
        });
    }
    async save(task) {
        const entity = this.toEntity(task);
        const savedEntity = await this.aiTaskEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async findById(id) {
        const entity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.aiTaskEntityRepository.find();
        return entities.map(entity => this.toDomain(entity));
    }
    async findByStatus(status, limit, offset) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { status },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findByPriority(priority, limit, offset) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { priority },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findByType(type, limit, offset) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { type },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findByUserId(userId, limit, offset) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { userId: userId.toString() },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findByCognitiveModelId(cognitiveModelId, limit, offset) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { cognitiveModelId: cognitiveModelId.toString() },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findByIds(ids) {
        const idStrings = ids.map(id => id.toString());
        const entities = await this.aiTaskEntityRepository.findBy({ id: { $in: idStrings } });
        return entities.map(entity => this.toDomain(entity));
    }
    async updateStatus(id, status) {
        await this.aiTaskEntityRepository.update({ id: id.toString() }, { status });
        const updatedEntity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
        if (!updatedEntity) {
            throw new Error(`AITask with ID ${id.toString()} not found`);
        }
        return this.toDomain(updatedEntity);
    }
    async updatePriority(id, priority) {
        await this.aiTaskEntityRepository.update({ id: id.toString() }, { priority });
        const updatedEntity = await this.aiTaskEntityRepository.findOneBy({ id: id.toString() });
        if (!updatedEntity) {
            throw new Error(`AITask with ID ${id.toString()} not found`);
        }
        return this.toDomain(updatedEntity);
    }
    async delete(id) {
        const result = await this.aiTaskEntityRepository.delete({ id: id.toString() });
        return (result.affected ?? 0) > 0;
    }
    async deleteAll() {
        const result = await this.aiTaskEntityRepository.delete({});
        return result.affected ?? 0;
    }
    async deleteByStatus(status) {
        const result = await this.aiTaskEntityRepository.delete({ status });
        return result.affected ?? 0;
    }
    async count() {
        return this.aiTaskEntityRepository.count();
    }
    async countByStatus(status) {
        return this.aiTaskEntityRepository.countBy({ status });
    }
    async countByType(type) {
        return this.aiTaskEntityRepository.countBy({ type });
    }
    async findExpiredTasks(threshold) {
        const now = new Date();
        const expiredTime = new Date(now.getTime() - threshold);
        const entities = await this.aiTaskEntityRepository.find({
            where: {
                status: AITask_2.AITaskStatus.RUNNING,
                startedAt: { $lt: expiredTime }
            }
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async findPendingTasks(limit) {
        const entities = await this.aiTaskEntityRepository.find({
            where: { status: AITask_2.AITaskStatus.PENDING },
            order: {
                priority: 'ASC',
                createdAt: 'ASC'
            },
            take: limit
        });
        return entities.map(entity => this.toDomain(entity));
    }
}
exports.AITaskRepositoryImpl = AITaskRepositoryImpl;
//# sourceMappingURL=ai-task-repository-implementation.js.map