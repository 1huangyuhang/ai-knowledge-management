"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSnapshotServiceImpl = void 0;
const uuid_1 = require("uuid");
const model_snapshot_1 = require("./types/model-snapshot");
class ModelSnapshotServiceImpl {
    snapshotRepository;
    compressionService;
    encryptionService;
    cognitiveModelRepository;
    constructor(snapshotRepository, compressionService, encryptionService, cognitiveModelRepository) {
        this.snapshotRepository = snapshotRepository;
        this.compressionService = compressionService;
        this.encryptionService = encryptionService;
        this.cognitiveModelRepository = cognitiveModelRepository;
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
                type: model_snapshot_1.SnapshotType.VERSIONED,
                data: {
                    conceptCount: model.concepts.length,
                    relationCount: model.relations.length,
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
            return await this.snapshotRepository.findById(snapshotId, userId);
        }
        catch (error) {
            console.error('Failed to get model snapshot:', error);
            return null;
        }
    }
    async getSnapshots(userId, options) {
        try {
            return await this.snapshotRepository.findByUserId(userId, options);
        }
        catch (error) {
            console.error('Failed to get model snapshots:', error);
            return [];
        }
    }
    async deleteSnapshot(userId, snapshotId) {
        try {
            return await this.snapshotRepository.delete(snapshotId, userId);
        }
        catch (error) {
            console.error('Failed to delete model snapshot:', error);
            return false;
        }
    }
    async compareSnapshots(snapshot1, snapshot2) {
        try {
            const model1Str = await this.compressionService.decompress(snapshot1.data.compressedModelData);
            const model2Str = await this.compressionService.decompress(snapshot2.data.compressedModelData);
            const model1 = JSON.parse(model1Str);
            const model2 = JSON.parse(model2Str);
            const conceptDiff = this.compareConcepts(model1.concepts, model2.concepts);
            const relationDiff = this.compareRelations(model1.relations, model2.relations);
            const totalChanges = conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
                relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
            const totalItems = model1.concepts.length + model1.relations.length;
            const changePercentage = totalItems > 0 ? (totalChanges / totalItems) * 100 : 0;
            const versionDiff = {
                id: (0, uuid_1.v4)(),
                userId: snapshot1.userId,
                fromVersion: snapshot1.version,
                toVersion: snapshot2.version,
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
            const snapshotDiff = {
                id: (0, uuid_1.v4)(),
                snapshot1: {
                    id: snapshot1.id,
                    version: snapshot1.version,
                    createdAt: snapshot1.createdAt
                },
                snapshot2: {
                    id: snapshot2.id,
                    version: snapshot2.version,
                    createdAt: snapshot2.createdAt
                },
                versionDiff,
                calculatedAt: new Date()
            };
            return snapshotDiff;
        }
        catch (error) {
            console.error('Failed to compare snapshots:', error);
            throw new Error('Failed to compare snapshots');
        }
    }
    async getModelSnapshot(userId, versionId) {
        try {
            return await this.snapshotRepository.findByVersion(versionId, userId);
        }
        catch (error) {
            console.error('Failed to get model snapshot by version:', error);
            return null;
        }
    }
    calculateModelHash(model) {
        const modelStr = JSON.stringify(model);
        let hash = 0;
        for (let i = 0; i < modelStr.length; i++) {
            const char = modelStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    compareConcepts(concepts1, concepts2) {
        const conceptMap1 = new Map(concepts1.map(c => [c.id, c]));
        const conceptMap2 = new Map(concepts2.map(c => [c.id, c]));
        const added = concepts2.filter(c => !conceptMap1.has(c.id));
        const removed = [...conceptMap1.keys()].filter(id => !conceptMap2.has(id));
        const updated = concepts2
            .filter(c => conceptMap1.has(c.id))
            .map(c => {
            const oldConcept = conceptMap1.get(c.id);
            const updatedFields = this.findUpdatedFields(oldConcept, c);
            return {
                id: c.id,
                before: oldConcept,
                after: c,
                updatedFields
            };
        })
            .filter(update => update.updatedFields.length > 0);
        return { added, updated, removed };
    }
    compareRelations(relations1, relations2) {
        const relationMap1 = new Map(relations1.map(r => [r.id, r]));
        const relationMap2 = new Map(relations2.map(r => [r.id, r]));
        const added = relations2.filter(r => !relationMap1.has(r.id));
        const removed = [...relationMap1.keys()].filter(id => !relationMap2.has(id));
        const updated = relations2
            .filter(r => relationMap1.has(r.id))
            .map(r => {
            const oldRelation = relationMap1.get(r.id);
            const updatedFields = this.findUpdatedFields(oldRelation, r);
            return {
                id: r.id,
                before: oldRelation,
                after: r,
                updatedFields
            };
        })
            .filter(update => update.updatedFields.length > 0);
        return { added, updated, removed };
    }
    findUpdatedFields(oldObj, newObj) {
        const updatedFields = [];
        for (const key in newObj) {
            if (newObj.hasOwnProperty(key)) {
                const oldValue = oldObj[key];
                const newValue = newObj[key];
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    updatedFields.push(key);
                }
            }
        }
        return updatedFields;
    }
}
exports.ModelSnapshotServiceImpl = ModelSnapshotServiceImpl;
//# sourceMappingURL=model-snapshot-service-impl.js.map