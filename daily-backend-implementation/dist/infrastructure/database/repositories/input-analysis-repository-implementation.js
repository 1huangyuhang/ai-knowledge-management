"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAnalysisRepositoryImpl = void 0;
const InputAnalysis_1 = require("../../../domain/entities/InputAnalysis");
const input_analysis_entity_1 = require("../entities/input-analysis.entity");
const UUID_1 = require("../../../domain/value-objects/UUID");
class InputAnalysisRepositoryImpl {
    inputAnalysisEntityRepository;
    constructor(inputAnalysisEntityRepository) {
        this.inputAnalysisEntityRepository = inputAnalysisEntityRepository;
    }
    toEntity(analysis) {
        const entity = new input_analysis_entity_1.InputAnalysisEntity();
        entity.id = analysis.id.toString();
        entity.inputId = analysis.inputId.toString();
        entity.type = analysis.type;
        entity.result = analysis.result;
        entity.status = analysis.status;
        entity.confidence = analysis.confidence;
        entity.createdAt = analysis.createdAt;
        entity.updatedAt = analysis.updatedAt;
        return entity;
    }
    toDomain(entity) {
        return new InputAnalysis_1.InputAnalysis({
            id: UUID_1.UUID.fromString(entity.id),
            inputId: UUID_1.UUID.fromString(entity.inputId),
            type: entity.type,
            result: entity.result,
            status: entity.status,
            confidence: entity.confidence,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        });
    }
    async save(analysis) {
        const entity = this.toEntity(analysis);
        const savedEntity = await this.inputAnalysisEntityRepository.save(entity);
        return this.toDomain(savedEntity);
    }
    async getById(id) {
        const entity = await this.inputAnalysisEntityRepository.findOneBy({ id: id.toString() });
        return entity ? this.toDomain(entity) : null;
    }
    async getByInputId(inputId) {
        const entities = await this.inputAnalysisEntityRepository.findBy({ inputId: inputId.toString() });
        return entities.map(entity => this.toDomain(entity));
    }
    async getByStatus(status, limit, offset) {
        const entities = await this.inputAnalysisEntityRepository.find({
            where: { status },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async getByType(type, limit, offset) {
        const entities = await this.inputAnalysisEntityRepository.find({
            where: { type },
            take: limit,
            skip: offset
        });
        return entities.map(entity => this.toDomain(entity));
    }
    async updateStatus(id, status) {
        await this.inputAnalysisEntityRepository.update({ id: id.toString() }, { status });
        const updatedEntity = await this.inputAnalysisEntityRepository.findOneBy({ id: id.toString() });
        if (!updatedEntity) {
            throw new Error(`InputAnalysis with ID ${id.toString()} not found`);
        }
        return this.toDomain(updatedEntity);
    }
    async delete(id) {
        const result = await this.inputAnalysisEntityRepository.delete({ id: id.toString() });
        return (result.affected ?? 0) > 0;
    }
    async deleteByInputId(inputId) {
        const result = await this.inputAnalysisEntityRepository.delete({ inputId: inputId.toString() });
        return result.affected ?? 0;
    }
    async getByIds(ids) {
        const idStrings = ids.map(id => id.toString());
        const entities = await this.inputAnalysisEntityRepository.findBy({ id: { $in: idStrings } });
        return entities.map(entity => this.toDomain(entity));
    }
}
exports.InputAnalysisRepositoryImpl = InputAnalysisRepositoryImpl;
//# sourceMappingURL=input-analysis-repository-implementation.js.map