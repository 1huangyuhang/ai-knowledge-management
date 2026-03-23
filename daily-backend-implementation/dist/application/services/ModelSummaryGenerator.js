"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSummaryGenerator = void 0;
class ModelSummaryGenerator {
    defaultOptions = {
        includeTopConcepts: 10,
        includeTopRelations: 10,
        includeConfidenceStats: true,
        includeStructureStats: true,
        includeGrowthStats: false,
        summaryLength: 'medium',
    };
    generateModelSummary(model, options = {}) {
        const startTime = Date.now();
        const mergedOptions = { ...this.defaultOptions, ...options };
        const stats = this.calculateStats(model, mergedOptions);
        const summary = this.generateSummaryText(model, stats, mergedOptions);
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            modelId: model.id,
            title: `认知模型摘要 - ${new Date().toLocaleDateString()}`,
            summary,
            stats,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                options: mergedOptions,
            },
        };
    }
    calculateStats(model, options) {
        const averageConceptConfidence = model.concepts.length > 0
            ? model.concepts.reduce((sum, concept) => sum + concept.confidence, 0) / model.concepts.length
            : 0;
        const averageRelationConfidence = model.relations.length > 0
            ? model.relations.reduce((sum, relation) => sum + relation.confidence, 0) / model.relations.length
            : 0;
        const averageRelationStrength = model.relations.length > 0
            ? model.relations.reduce((sum, relation) => sum + relation.strength, 0) / model.relations.length
            : 0;
        const maxPossibleEdges = model.concepts.length * (model.concepts.length - 1) / 2;
        const structureDensity = maxPossibleEdges > 0
            ? model.relations.length / maxPossibleEdges
            : 0;
        const topConcepts = [...model.concepts]
            .sort((a, b) => {
            const centralityA = a.metadata.centrality || 0;
            const centralityB = b.metadata.centrality || 0;
            if (centralityA !== centralityB)
                return centralityB - centralityA;
            if (a.confidence !== b.confidence)
                return b.confidence - a.confidence;
            return b.occurrenceCount - a.occurrenceCount;
        })
            .slice(0, options.includeTopConcepts)
            .map(concept => ({
            name: concept.name,
            confidence: concept.confidence,
            occurrenceCount: concept.occurrenceCount,
            centrality: concept.metadata.centrality,
        }));
        const topRelations = [...model.relations]
            .sort((a, b) => {
            if (a.strength !== b.strength)
                return b.strength - a.strength;
            if (a.confidence !== b.confidence)
                return b.confidence - a.confidence;
            return b.occurrenceCount - a.occurrenceCount;
        })
            .slice(0, options.includeTopRelations)
            .map(relation => {
            const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
            const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
            return {
                source: sourceConcept?.name || relation.sourceConceptId,
                target: targetConcept?.name || relation.targetConceptId,
                type: relation.type,
                confidence: relation.confidence,
                strength: relation.strength,
                occurrenceCount: relation.occurrenceCount,
            };
        });
        return {
            conceptCount: model.concepts.length,
            relationCount: model.relations.length,
            averageConceptConfidence,
            averageRelationConfidence,
            averageRelationStrength,
            topConcepts,
            topRelations,
            structureDensity,
        };
    }
    generateSummaryText(model, stats, options) {
        let summaryParts = [];
        summaryParts.push(`# 认知模型摘要`);
        summaryParts.push(`
## 基本信息`);
        summaryParts.push(`- 模型ID: ${model.id}`);
        summaryParts.push(`- 创建时间: ${model.createdAt.toLocaleString()}`);
        summaryParts.push(`- 更新时间: ${model.updatedAt.toLocaleString()}`);
        summaryParts.push(`
## 结构统计`);
        summaryParts.push(`- 概念数量: ${stats.conceptCount}`);
        summaryParts.push(`- 关系数量: ${stats.relationCount}`);
        summaryParts.push(`- 结构密度: ${(stats.structureDensity * 100).toFixed(2)}%`);
        if (options.includeConfidenceStats) {
            summaryParts.push(`
## 置信度统计`);
            summaryParts.push(`- 平均概念置信度: ${stats.averageConceptConfidence.toFixed(2)}`);
            summaryParts.push(`- 平均关系置信度: ${stats.averageRelationConfidence.toFixed(2)}`);
            summaryParts.push(`- 平均关系强度: ${stats.averageRelationStrength.toFixed(2)}`);
        }
        if (stats.topConcepts.length > 0) {
            summaryParts.push(`
## 核心概念`);
            stats.topConcepts.forEach((concept, index) => {
                const centralityText = concept.centrality ? `, 中心度: ${concept.centrality.toFixed(2)}` : '';
                summaryParts.push(`${index + 1}. ${concept.name} (置信度: ${concept.confidence.toFixed(2)}, 出现次数: ${concept.occurrenceCount}${centralityText})`);
            });
        }
        if (stats.topRelations.length > 0 && options.summaryLength !== 'short') {
            summaryParts.push(`
## 关键关系`);
            stats.topRelations.forEach((relation, index) => {
                summaryParts.push(`${index + 1}. ${relation.source} ↔ ${relation.target} (${relation.type}, 强度: ${relation.strength.toFixed(2)}, 置信度: ${relation.confidence.toFixed(2)})`);
            });
        }
        if (options.includeStructureStats && options.summaryLength === 'long') {
            summaryParts.push(`
## 结构分析`);
            if (stats.structureDensity < 0.1) {
                summaryParts.push(`- 模型结构较为稀疏，概念之间的连接较少，建议增加相关概念的关联关系。`);
            }
            else if (stats.structureDensity > 0.5) {
                summaryParts.push(`- 模型结构较为密集，概念之间的连接丰富，形成了较为完整的认知网络。`);
            }
            else {
                summaryParts.push(`- 模型结构密度适中，概念之间存在一定的连接关系，建议继续丰富概念之间的关联。`);
            }
            if (stats.averageConceptConfidence < 0.5) {
                summaryParts.push(`- 模型概念的平均置信度较低，建议增加相关概念的出现次数以提高置信度。`);
            }
            else {
                summaryParts.push(`- 模型概念的平均置信度较高，表明模型对概念的认知较为稳定。`);
            }
        }
        return summaryParts.join('\n');
    }
}
exports.ModelSummaryGenerator = ModelSummaryGenerator;
//# sourceMappingURL=ModelSummaryGenerator.js.map