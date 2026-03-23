"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSnapshotServiceImpl = void 0;
const uuid_1 = require("uuid");
const evolution_history_types_1 = require("../types/evolution-history.types");
class ModelSnapshotServiceImpl {
    snapshotRepository;
    compressionService;
    encryptionService;
    constructor(snapshotRepository, compressionService, encryptionService) {
        this.snapshotRepository = snapshotRepository;
        this.compressionService = compressionService;
        this.encryptionService = encryptionService;
    }
    async createSnapshot(userId, model, versionId) {
        try {
            const compressedData = await this.compressionService.compress(JSON.stringify(model));
            const modelHash = this.calculateModelHash(model);
            const snapshot = {
                id: (0, uuid_1.v4)(),
                userId,
                version: versionId,
                createdAt: new Date(),
                type: evolution_history_types_1.SnapshotType.VERSIONED,
                data: {
                    conceptCount: model.concepts?.length || 0,
                    relationCount: model.relations?.length || 0,
                    sizeInBytes: JSON.stringify(model).length,
                    compressedModelData: compressedData,
                    modelHash
                },
                metadata: {
                    description: `Snapshot for version ${versionId}`,
                    creationReason: 'Automatic version snapshot',
                    systemVersion: process.env.SYSTEM_VERSION || 'unknown'
                }
            };
            await this.snapshotRepository.save(snapshot);
            return snapshot;
        }
        catch (error) {
            console.error('Failed to create model snapshot:', error);
            throw new Error('Failed to create model snapshot');
        }
    }
    async getSnapshot(userId, snapshotId) {
        try {
            return await this.snapshotRepository.findById(snapshotId);
        }
        catch (error) {
            console.error('Failed to get snapshot by ID:', error);
            throw new Error('Failed to get snapshot by ID');
        }
    }
    async getSnapshots(userId, options) {
        try {
            const query = { userId };
            if (options?.snapshotTypes) {
                query.type = { $in: options.snapshotTypes };
            }
            if (options?.startTime) {
                query.createdAt = { $gte: options.startTime };
            }
            if (options?.endTime) {
                query.createdAt = { ...query.createdAt, $lte: options.endTime };
            }
            if (options?.versions) {
                query.version = { $in: options.versions };
            }
            let snapshots = await this.snapshotRepository.find(query);
            if (options?.sortBy) {
                snapshots.sort((a, b) => {
                    const order = options.sortOrder === 'desc' ? -1 : 1;
                    if (options.sortBy === 'createdAt') {
                        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
                    }
                    else if (options.sortBy === 'version') {
                        return a.version.localeCompare(b.version) * order;
                    }
                    return 0;
                });
            }
            if (options?.limit) {
                const offset = options.offset || 0;
                snapshots = snapshots.slice(offset, offset + options.limit);
            }
            return snapshots;
        }
        catch (error) {
            console.error('Failed to get snapshots:', error);
            throw new Error('Failed to get snapshots');
        }
    }
    async deleteSnapshot(userId, snapshotId) {
        try {
            const snapshot = await this.snapshotRepository.findById(snapshotId);
            if (!snapshot || snapshot.userId !== userId) {
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Failed to delete snapshot:', error);
            return false;
        }
    }
    async compareSnapshots(snapshot1, snapshot2) {
        try {
            const model1 = await this.restoreModelFromSnapshot(snapshot1);
            const model2 = await this.restoreModelFromSnapshot(snapshot2);
            const conceptDiff = this.compareConcepts(model1.concepts || [], model2.concepts || []);
            const relationDiff = this.compareRelations(model1.relations || [], model2.relations || []);
            const totalChanges = conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
                relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
            const totalItems = (model1.concepts?.length || 0) + (model1.relations?.length || 0);
            const changePercentage = totalItems > 0 ? (totalChanges / totalItems) * 100 : 0;
            const diff = {
                id: (0, uuid_1.v4)(),
                snapshotId1: snapshot1.id,
                snapshotId2: snapshot2.id,
                calculatedAt: new Date(),
                conceptDiff,
                relationDiff,
                statistics: {
                    totalChanges,
                    conceptChanges: conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length,
                    relationChanges: relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length,
                    changePercentage
                }
            };
            return diff;
        }
        catch (error) {
            console.error('Failed to compare snapshots:', error);
            throw new Error('Failed to compare snapshots');
        }
    }
    async getModelSnapshot(userId, versionId) {
        try {
            return await this.snapshotRepository.findByUserIdAndVersion(userId, versionId);
        }
        catch (error) {
            console.error('Failed to get snapshot by version:', error);
            throw new Error('Failed to get snapshot by version');
        }
    }
    async restoreModelFromSnapshot(snapshot) {
        try {
            const decompressedData = await this.compressionService.decompress(snapshot.data.compressedModelData);
            const model = JSON.parse(decompressedData);
            const modelHash = this.calculateModelHash(model);
            if (modelHash !== snapshot.data.modelHash) {
                throw new Error('Model hash mismatch, data may be corrupted');
            }
            return model;
        }
        catch (error) {
            console.error('Failed to restore model from snapshot:', error);
            throw new Error('Failed to restore model from snapshot');
        }
    }
    calculateModelHash(model) {
        const modelString = JSON.stringify(model);
        let hash = 0;
        for (let i = 0; i < modelString.length; i++) {
            const char = modelString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    compareConcepts(concepts1, concepts2) {
        const conceptMap1 = new Map(concepts1.map(c => [c.id, c]));
        const conceptMap2 = new Map(concepts2.map(c => [c.id, c]));
        const added = [];
        const updated = [];
        const removed = [];
        for (const [id, concept2] of conceptMap2) {
            if (conceptMap1.has(id)) {
                const concept1 = conceptMap1.get(id);
                const changedFields = this.getChangedFields(concept1, concept2);
                if (changedFields.length > 0) {
                    updated.push({
                        conceptId: id,
                        oldConcept: concept1,
                        newConcept: concept2,
                        changedFields
                    });
                }
            }
            else {
                added.push(concept2);
            }
        }
        for (const [id] of conceptMap1) {
            if (!conceptMap2.has(id)) {
                removed.push(id);
            }
        }
        return { added, updated, removed };
    }
    compareRelations(relations1, relations2) {
        const relationMap1 = new Map(relations1.map(r => [r.id, r]));
        const relationMap2 = new Map(relations2.map(r => [r.id, r]));
        const added = [];
        const updated = [];
        const removed = [];
        for (const [id, relation2] of relationMap2) {
            if (relationMap1.has(id)) {
                const relation1 = relationMap1.get(id);
                const changedFields = this.getChangedFields(relation1, relation2);
                if (changedFields.length > 0) {
                    updated.push({
                        relationId: id,
                        oldRelation: relation1,
                        newRelation: relation2,
                        changedFields
                    });
                }
            }
            else {
                added.push(relation2);
            }
        }
        for (const [id] of relationMap1) {
            if (!relationMap2.has(id)) {
                removed.push(id);
            }
        }
        return { added, updated, removed };
    }
    getChangedFields(obj1, obj2) {
        const changedFields = [];
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        for (const key of allKeys) {
            if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                changedFields.push(key);
            }
        }
        return changedFields;
    }
}
exports.ModelSnapshotServiceImpl = ModelSnapshotServiceImpl;
//# sourceMappingURL=model-snapshot-service-impl.js.map