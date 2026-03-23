"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GapIdentificationServiceImpl = void 0;
const uuid_1 = require("uuid");
class GapIdentificationServiceImpl {
    cognitiveModelRepository;
    constructor(cognitiveModelRepository) {
        this.cognitiveModelRepository = cognitiveModelRepository;
    }
    async identifyGaps(userId, modelId, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const gaps = [];
        const conceptCoverageGaps = this.detectConceptCoverageGaps(concepts, relations);
        gaps.push(...conceptCoverageGaps);
        const relationGaps = this.detectRelationGaps(concepts, relations);
        gaps.push(...relationGaps);
        const hierarchyGaps = this.detectHierarchyGaps(concepts, relations);
        gaps.push(...hierarchyGaps);
        const evolutionGaps = this.detectEvolutionGaps(concepts, relations);
        gaps.push(...evolutionGaps);
        const filteredGaps = this.filterGaps(gaps, options);
        const gapDistribution = this.calculateGapDistribution(filteredGaps);
        const result = {
            id: (0, uuid_1.v4)(),
            gaps: filteredGaps,
            gapDistribution,
            summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
            recommendations: this.generateRecommendations(filteredGaps),
            createdAt: new Date()
        };
        return result;
    }
    async identifyGapsBetweenConcepts(userId, modelId, conceptIds, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await Promise.all(conceptIds.map(conceptId => this.cognitiveModelRepository.getConceptById(userId, modelId, conceptId)));
        const validConcepts = concepts.filter(concept => concept !== null);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const relevantRelations = relations.filter(relation => conceptIds.includes(relation.sourceConceptId) || conceptIds.includes(relation.targetConceptId));
        const gaps = [];
        const conceptCoverageGaps = this.detectConceptCoverageGaps(validConcepts, relevantRelations);
        gaps.push(...conceptCoverageGaps);
        const relationGaps = this.detectRelationGaps(validConcepts, relevantRelations);
        gaps.push(...relationGaps);
        const filteredGaps = this.filterGaps(gaps, options);
        const gapDistribution = this.calculateGapDistribution(filteredGaps);
        const result = {
            id: (0, uuid_1.v4)(),
            gaps: filteredGaps,
            gapDistribution,
            summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
            recommendations: this.generateRecommendations(filteredGaps),
            createdAt: new Date()
        };
        return result;
    }
    async identifyGapsByType(userId, modelId, gapTypes, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const gaps = [];
        if (gapTypes.includes('CONCEPT_COVERAGE')) {
            const conceptCoverageGaps = this.detectConceptCoverageGaps(concepts, relations);
            gaps.push(...conceptCoverageGaps);
        }
        if (gapTypes.includes('RELATION')) {
            const relationGaps = this.detectRelationGaps(concepts, relations);
            gaps.push(...relationGaps);
        }
        if (gapTypes.includes('HIERARCHY')) {
            const hierarchyGaps = this.detectHierarchyGaps(concepts, relations);
            gaps.push(...hierarchyGaps);
        }
        if (gapTypes.includes('EVOLUTION')) {
            const evolutionGaps = this.detectEvolutionGaps(concepts, relations);
            gaps.push(...evolutionGaps);
        }
        const filteredGaps = this.filterGaps(gaps, options);
        const gapDistribution = this.calculateGapDistribution(filteredGaps);
        const result = {
            id: (0, uuid_1.v4)(),
            gaps: filteredGaps,
            gapDistribution,
            summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
            recommendations: this.generateRecommendations(filteredGaps),
            createdAt: new Date()
        };
        return result;
    }
    async identifyGapsFromReferenceModel(userId, modelId, referenceModelId, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const referenceModel = await this.cognitiveModelRepository.getById(userId, referenceModelId);
        if (!referenceModel) {
            throw new Error(`Reference cognitive model not found: ${referenceModelId}`);
        }
        const currentConcepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const currentRelations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const referenceConcepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, referenceModelId);
        const referenceRelations = await this.cognitiveModelRepository.getRelationsByModelId(userId, referenceModelId);
        const gaps = [];
        const conceptCoverageGaps = this.detectConceptCoverageGapWithReference(currentConcepts, referenceConcepts, currentRelations, referenceRelations);
        gaps.push(...conceptCoverageGaps);
        const filteredGaps = this.filterGaps(gaps, options);
        const gapDistribution = this.calculateGapDistribution(filteredGaps);
        const result = {
            id: (0, uuid_1.v4)(),
            gaps: filteredGaps,
            gapDistribution,
            summary: this.generateIdentificationSummary(filteredGaps, gapDistribution),
            recommendations: this.generateRecommendations(filteredGaps),
            createdAt: new Date()
        };
        return result;
    }
    async analyzeGapImpact(userId, modelId, gapId) {
        return {
            size: 8.0,
            improvementDirection: '建议深入学习相关概念，建立更多的概念连接，完善认知模型结构'
        };
    }
    detectConceptCoverageGaps(concepts, relations) {
        const gaps = [];
        if (concepts.length < 5) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                description: '概念覆盖不足，认知模型可能不够完整',
                type: 'CONCEPT_COVERAGE',
                size: 6.5,
                relatedConcepts: [],
                relatedRelations: [],
                improvementDirection: '建议添加更多相关概念，丰富认知模型'
            });
        }
        return gaps;
    }
    detectRelationGaps(concepts, relations) {
        const gaps = [];
        const expectedRelations = concepts.length * 2;
        if (relations.length < expectedRelations * 0.5) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                description: '概念间关系不足，认知模型结构较为松散',
                type: 'RELATION',
                size: 7.0,
                relatedConcepts: [],
                relatedRelations: [],
                improvementDirection: '建议建立更多概念间的关系，加强认知模型的结构完整性'
            });
        }
        return gaps;
    }
    detectHierarchyGaps(concepts, relations) {
        const gaps = [];
        const hierarchyRelations = relations.filter((relation) => relation.type === 'IS_A' || relation.type === 'PART_OF');
        if (hierarchyRelations.length < 2) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                description: '层次结构不清晰，缺乏明确的概念层级关系',
                type: 'HIERARCHY',
                size: 5.5,
                relatedConcepts: [],
                relatedRelations: [],
                improvementDirection: '建议建立明确的概念层级关系，如父子关系、部分整体关系等'
            });
        }
        return gaps;
    }
    detectEvolutionGaps(concepts, relations) {
        const gaps = [];
        gaps.push({
            id: (0, uuid_1.v4)(),
            description: '演化记录不足，难以追踪认知模型的发展变化',
            type: 'EVOLUTION',
            size: 4.5,
            relatedConcepts: [],
            relatedRelations: [],
            improvementDirection: '建议定期更新认知模型，记录概念和关系的演化过程'
        });
        return gaps;
    }
    detectConceptCoverageGapWithReference(currentConcepts, referenceConcepts, currentRelations, referenceRelations) {
        const gaps = [];
        const referenceConceptNames = new Set(referenceConcepts.map(concept => concept.name));
        const currentConceptNames = new Set(currentConcepts.map(concept => concept.name));
        const missingConcepts = referenceConcepts.filter(concept => !currentConceptNames.has(concept.name));
        if (missingConcepts.length > 0) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                description: `与参考模型相比，缺少 ${missingConcepts.length} 个重要概念`,
                type: 'CONCEPT_COVERAGE',
                size: 7.5,
                relatedConcepts: [],
                relatedRelations: [],
                improvementDirection: `建议参考模型，添加缺失的概念：${missingConcepts.map(c => c.name).join(', ')}`
            });
        }
        return gaps;
    }
    filterGaps(gaps, options) {
        let filtered = [...gaps];
        if (options?.gapSizeThreshold !== undefined) {
            filtered = filtered.filter(gap => gap.size >= options.gapSizeThreshold);
        }
        if (options?.gapTypes && options.gapTypes.length > 0) {
            filtered = filtered.filter(gap => options.gapTypes.includes(gap.type));
        }
        return filtered;
    }
    calculateGapDistribution(gaps) {
        const distribution = {};
        gaps.forEach(gap => {
            distribution[gap.type] = (distribution[gap.type] || 0) + 1;
        });
        return distribution;
    }
    generateIdentificationSummary(gaps, distribution) {
        const totalGaps = gaps.length;
        if (totalGaps === 0) {
            return '未检测到明显的认知差距';
        }
        const typeSummary = Object.entries(distribution)
            .map(([type, count]) => `${type}: ${count}个`)
            .join(', ');
        return `共识别到 ${totalGaps} 个认知差距，分布情况：${typeSummary}`;
    }
    generateRecommendations(gaps) {
        if (gaps.length === 0) {
            return ['您的认知模型较为完善，继续保持'];
        }
        const recommendations = [
            '针对识别到的差距，建议进一步完善认知模型',
            '根据改进方向，添加缺失的概念和关系',
            '定期与参考模型进行比较，发现和弥补新的差距'
        ];
        return recommendations;
    }
}
exports.GapIdentificationServiceImpl = GapIdentificationServiceImpl;
//# sourceMappingURL=gap-identification-service-impl.js.map