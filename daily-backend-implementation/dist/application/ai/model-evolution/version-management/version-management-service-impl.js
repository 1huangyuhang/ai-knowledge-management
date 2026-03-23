"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionManagementServiceImpl = void 0;
const uuid_1 = require("uuid");
const version_management_service_1 = require("./version-management-service");
class VersionManagementServiceImpl {
    versionRepository;
    modelSnapshotService;
    constructor(versionRepository, modelSnapshotService) {
        this.versionRepository = versionRepository;
        this.modelSnapshotService = modelSnapshotService;
    }
    async getVersions(userId, options) {
        return this.versionRepository.find(userId, options || {});
    }
    async getVersionById(userId, versionId) {
        return this.versionRepository.findById(userId, versionId);
    }
    async createVersion(userId, model, options) {
        const versionNumber = this.generateVersionNumber();
        const version = {
            id: (0, uuid_1.v4)(),
            name: options?.name || `Version ${versionNumber}`,
            version: versionNumber,
            userId,
            modelId: model.id,
            description: options?.description,
            tags: options?.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isMajor: options?.isMajor || false,
            status: version_management_service_1.VersionStatus.PUBLISHED,
            statistics: {
                conceptCount: model.concepts?.length || 0,
                relationCount: model.relations?.length || 0,
                modelSize: this.calculateModelSize(model),
                creationTime: Date.now()
            }
        };
        return this.versionRepository.save(version);
    }
    async updateVersion(userId, versionId, updates) {
        const version = await this.versionRepository.findById(userId, versionId);
        if (!version) {
            return null;
        }
        const updatedVersion = {
            ...version,
            ...updates,
            updatedAt: new Date()
        };
        return this.versionRepository.save(updatedVersion);
    }
    async deleteVersion(userId, versionId) {
        return this.versionRepository.delete(userId, versionId);
    }
    async compareVersions(userId, version1, version2) {
        const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
        const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);
        if (!snapshot1 || !snapshot2) {
            throw new Error('One or both versions not found');
        }
        const conceptDiff = this.compareConcepts(snapshot1.data, snapshot2.data);
        const relationDiff = this.compareRelations(snapshot1.data, snapshot2.data);
        const totalChanges = conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
            relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
        const conceptChanges = conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length;
        const relationChanges = relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
        const totalConceptsAndRelations = snapshot1.data.concepts.length + snapshot1.data.relations.length;
        const changePercentage = totalConceptsAndRelations > 0
            ? (totalChanges / totalConceptsAndRelations) * 100
            : 0;
        const changeSummary = this.generateChangeSummary(conceptDiff, relationDiff);
        return {
            id: (0, uuid_1.v4)(),
            version1,
            version2,
            comparedAt: new Date(),
            conceptDiff,
            relationDiff,
            statistics: {
                totalChanges,
                conceptChanges,
                relationChanges,
                changePercentage
            },
            changeSummary
        };
    }
    async getLatestVersion(userId) {
        const options = {
            pagination: {
                page: 1,
                limit: 1
            }
        };
        const versions = await this.versionRepository.find(userId, options);
        return versions.length > 0 ? versions[0] : null;
    }
    async getVersionHistory(userId, timeRange) {
        const options = {};
        if (timeRange) {
            options.createdAtRange = timeRange;
        }
        return this.versionRepository.find(userId, options);
    }
    generateVersionNumber() {
        return `v${Date.now()}`;
    }
    calculateModelSize(model) {
        try {
            const modelString = JSON.stringify(model);
            return Buffer.byteLength(modelString, 'utf8');
        }
        catch (error) {
            return 0;
        }
    }
    compareConcepts(model1, model2) {
        const concepts1 = new Map(model1.concepts.map((c) => [c.id, c]));
        const concepts2 = new Map(model2.concepts.map((c) => [c.id, c]));
        const added = [];
        const updated = [];
        const removed = [];
        const renamed = [];
        for (const [id, concept2] of concepts2) {
            if (!concepts1.has(id)) {
                added.push(id);
            }
            else {
                const concept1 = concepts1.get(id);
                if (JSON.stringify(concept1) !== JSON.stringify(concept2)) {
                    updated.push(id);
                    if (concept1.name !== concept2.name) {
                        renamed.push({ oldName: concept1.name, newName: concept2.name });
                    }
                }
            }
        }
        for (const [id] of concepts1) {
            if (!concepts2.has(id)) {
                removed.push(id);
            }
        }
        return { added, updated, removed, renamed };
    }
    compareRelations(model1, model2) {
        const relations1 = new Map(model1.relations.map((r) => [this.getRelationKey(r), r]));
        const relations2 = new Map(model2.relations.map((r) => [this.getRelationKey(r), r]));
        const added = [];
        const updated = [];
        const removed = [];
        for (const [key, relation2] of relations2) {
            if (!relations1.has(key)) {
                added.push(key);
            }
            else {
                const relation1 = relations1.get(key);
                if (JSON.stringify(relation1) !== JSON.stringify(relation2)) {
                    updated.push(key);
                }
            }
        }
        for (const [key] of relations1) {
            if (!relations2.has(key)) {
                removed.push(key);
            }
        }
        return { added, updated, removed };
    }
    getRelationKey(relation) {
        return `${relation.sourceConceptId}_${relation.targetConceptId}_${relation.type}`;
    }
    generateChangeSummary(conceptDiff, relationDiff) {
        const summary = [];
        if (conceptDiff.added.length > 0) {
            summary.push(`新增了 ${conceptDiff.added.length} 个概念`);
        }
        if (conceptDiff.updated.length > 0) {
            summary.push(`更新了 ${conceptDiff.updated.length} 个概念`);
        }
        if (conceptDiff.removed.length > 0) {
            summary.push(`删除了 ${conceptDiff.removed.length} 个概念`);
        }
        if (conceptDiff.renamed.length > 0) {
            summary.push(`重命名了 ${conceptDiff.renamed.length} 个概念`);
        }
        if (relationDiff.added.length > 0) {
            summary.push(`新增了 ${relationDiff.added.length} 个关系`);
        }
        if (relationDiff.updated.length > 0) {
            summary.push(`更新了 ${relationDiff.updated.length} 个关系`);
        }
        if (relationDiff.removed.length > 0) {
            summary.push(`删除了 ${relationDiff.removed.length} 个关系`);
        }
        return summary.join('，');
    }
}
exports.VersionManagementServiceImpl = VersionManagementServiceImpl;
//# sourceMappingURL=version-management-service-impl.js.map