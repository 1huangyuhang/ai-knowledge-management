"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionComparisonServiceImpl = void 0;
const uuid_1 = require("uuid");
class VersionComparisonServiceImpl {
    modelSnapshotService;
    evolutionEventRepository;
    constructor(modelSnapshotService, evolutionEventRepository) {
        this.modelSnapshotService = modelSnapshotService;
        this.evolutionEventRepository = evolutionEventRepository;
    }
    async compareVersions(userId, version1, version2) {
        const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
        const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);
        if (!snapshot1 || !snapshot2) {
            throw new Error('One or both snapshots not found');
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
        return {
            id: (0, uuid_1.v4)(),
            userId,
            fromVersion: version1,
            toVersion: version2,
            calculatedAt: new Date(),
            conceptDiff,
            relationDiff,
            statistics: {
                totalChanges,
                conceptChanges,
                relationChanges,
                changePercentage: Math.round(changePercentage * 100) / 100
            }
        };
    }
    async getConceptDiff(userId, version1, version2) {
        const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
        const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);
        if (!snapshot1 || !snapshot2) {
            throw new Error('One or both snapshots not found');
        }
        return this.compareConcepts(snapshot1.data, snapshot2.data);
    }
    async getRelationDiff(userId, version1, version2) {
        const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
        const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);
        if (!snapshot1 || !snapshot2) {
            throw new Error('One or both snapshots not found');
        }
        return this.compareRelations(snapshot1.data, snapshot2.data);
    }
    async generateComparisonReport(userId, version1, version2) {
        const versionDiff = await this.compareVersions(userId, version1, version2);
        const events = await this.evolutionEventRepository.find({
            userId,
            version: {
                $in: [version1, version2]
            }
        });
        const changeSummary = this.generateChangeSummary(versionDiff);
        const recommendations = this.generateRecommendations(versionDiff);
        return {
            id: (0, uuid_1.v4)(),
            userId,
            version1,
            version2,
            generatedAt: new Date(),
            versionDiff,
            changeSummary,
            recommendations,
            relatedEvents: events
        };
    }
    compareConcepts(model1, model2) {
        const conceptDiff = {
            added: [],
            updated: [],
            removed: []
        };
        const conceptMap1 = new Map(model1.concepts.map((c) => [c.id, c]));
        const conceptMap2 = new Map(model2.concepts.map((c) => [c.id, c]));
        for (const [id, concept2] of conceptMap2) {
            const concept1 = conceptMap1.get(id);
            if (!concept1) {
                conceptDiff.added.push(concept2);
            }
            else if (this.areConceptsDifferent(concept1, concept2)) {
                conceptDiff.updated.push({
                    old: concept1,
                    new: concept2
                });
            }
        }
        for (const [id, concept1] of conceptMap1) {
            if (!conceptMap2.has(id)) {
                conceptDiff.removed.push(concept1);
            }
        }
        return conceptDiff;
    }
    compareRelations(model1, model2) {
        const relationDiff = {
            added: [],
            updated: [],
            removed: []
        };
        const relationMap1 = new Map(model1.relations.map((r) => [r.id, r]));
        const relationMap2 = new Map(model2.relations.map((r) => [r.id, r]));
        for (const [id, relation2] of relationMap2) {
            const relation1 = relationMap1.get(id);
            if (!relation1) {
                relationDiff.added.push(relation2);
            }
            else if (this.areRelationsDifferent(relation1, relation2)) {
                relationDiff.updated.push({
                    old: relation1,
                    new: relation2
                });
            }
        }
        for (const [id, relation1] of relationMap1) {
            if (!relationMap2.has(id)) {
                relationDiff.removed.push(relation1);
            }
        }
        return relationDiff;
    }
    areConceptsDifferent(concept1, concept2) {
        return JSON.stringify({
            name: concept1.name,
            description: concept1.description,
            weight: concept1.weight,
            confidence: concept1.confidence,
            parentId: concept1.parentId,
            attributes: concept1.attributes
        }) !== JSON.stringify({
            name: concept2.name,
            description: concept2.description,
            weight: concept2.weight,
            confidence: concept2.confidence,
            parentId: concept2.parentId,
            attributes: concept2.attributes
        });
    }
    areRelationsDifferent(relation1, relation2) {
        return JSON.stringify({
            fromConceptId: relation1.fromConceptId,
            toConceptId: relation1.toConceptId,
            type: relation1.type,
            weight: relation1.weight,
            confidence: relation1.confidence,
            description: relation1.description
        }) !== JSON.stringify({
            fromConceptId: relation2.fromConceptId,
            toConceptId: relation2.toConceptId,
            type: relation2.type,
            weight: relation2.weight,
            confidence: relation2.confidence,
            description: relation2.description
        });
    }
    generateChangeSummary(versionDiff) {
        const summary = [
            `从版本 ${versionDiff.fromVersion} 到 ${versionDiff.toVersion}，模型共发生了 ${versionDiff.statistics.totalChanges} 处变化。`,
            `其中概念变化 ${versionDiff.statistics.conceptChanges} 处（新增 ${versionDiff.conceptDiff.added.length}，更新 ${versionDiff.conceptDiff.updated.length}，删除 ${versionDiff.conceptDiff.removed.length}）。`,
            `关系变化 ${versionDiff.statistics.relationChanges} 处（新增 ${versionDiff.relationDiff.added.length}，更新 ${versionDiff.relationDiff.updated.length}，删除 ${versionDiff.relationDiff.removed.length}）。`,
            `总体变化率为 ${versionDiff.statistics.changePercentage}%。`
        ];
        return summary.join(' ');
    }
    generateRecommendations(versionDiff) {
        const recommendations = [];
        if (versionDiff.conceptDiff.added.length > 5) {
            recommendations.push('新增概念较多，建议检查概念之间的层次关系是否合理。');
        }
        if (versionDiff.conceptDiff.removed.length > 5) {
            recommendations.push('删除概念较多，建议确认删除的概念是否真的不再需要。');
        }
        if (versionDiff.relationDiff.added.length > 10) {
            recommendations.push('新增关系较多，建议检查关系类型和权重设置是否合理。');
        }
        if (versionDiff.relationDiff.removed.length > 10) {
            recommendations.push('删除关系较多，建议确认删除的关系是否影响了模型的完整性。');
        }
        if (versionDiff.statistics.changePercentage > 50) {
            recommendations.push('模型变化较大，建议进行全面的一致性验证。');
        }
        if (recommendations.length === 0) {
            recommendations.push('模型变化合理，建议继续观察模型的演化趋势。');
        }
        return recommendations;
    }
}
exports.VersionComparisonServiceImpl = VersionComparisonServiceImpl;
//# sourceMappingURL=version-comparison-service-impl.js.map