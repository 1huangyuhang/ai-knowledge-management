"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightGenerationServiceImpl = void 0;
const uuid_1 = require("uuid");
const cognitive_feedback_1 = require("@/domain/ai/cognitive-feedback/cognitive-feedback");
class InsightGenerationServiceImpl {
    cognitiveModelRepository;
    cognitiveConceptRepository;
    cognitiveRelationRepository;
    evolutionAnalysisService;
    dataAnalysisService;
    constructor(cognitiveModelRepository, cognitiveConceptRepository, cognitiveRelationRepository, evolutionAnalysisService, dataAnalysisService) {
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.cognitiveConceptRepository = cognitiveConceptRepository;
        this.cognitiveRelationRepository = cognitiveRelationRepository;
        this.evolutionAnalysisService = evolutionAnalysisService;
        this.dataAnalysisService = dataAnalysisService;
    }
    async generateInsights(userId, modelId, options) {
        const insights = [];
        const insightTypes = options?.insightTypes || Object.values(cognitive_feedback_1.CognitiveInsightType);
        if (insightTypes.includes(cognitive_feedback_1.CognitiveInsightType.CONCEPT_INSIGHT)) {
            const conceptInsights = await this.generateConceptInsights(userId, modelId, []);
            insights.push(...conceptInsights);
        }
        if (insightTypes.includes(cognitive_feedback_1.CognitiveInsightType.RELATION_INSIGHT)) {
            const relationInsights = await this.generateRelationInsights(userId, modelId, []);
            insights.push(...relationInsights);
        }
        if (insightTypes.includes(cognitive_feedback_1.CognitiveInsightType.STRUCTURE_INSIGHT)) {
            const structureInsights = await this.generateStructureInsights(userId, modelId);
            insights.push(...structureInsights);
        }
        if (insightTypes.includes(cognitive_feedback_1.CognitiveInsightType.EVOLUTION_INSIGHT)) {
            const evolutionInsights = await this.generateEvolutionInsights(userId, modelId);
            insights.push(...evolutionInsights);
        }
        let filteredInsights = insights;
        if (options?.importanceThreshold !== undefined) {
            filteredInsights = filteredInsights.filter(insight => insight.importance >= options.importanceThreshold);
        }
        if (options?.confidenceThreshold !== undefined) {
            filteredInsights = filteredInsights.filter(insight => insight.confidence >= options.confidenceThreshold);
        }
        if (options?.maxInsights !== undefined && filteredInsights.length > options.maxInsights) {
            filteredInsights = filteredInsights
                .sort((a, b) => b.importance - a.importance)
                .slice(0, options.maxInsights);
        }
        return filteredInsights;
    }
    async generateConceptInsights(userId, modelId, conceptIds) {
        const insights = [];
        const model = await this.cognitiveModelRepository.findById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model ${modelId} not found for user ${userId}`);
        }
        let concepts;
        if (conceptIds.length > 0) {
            concepts = await this.cognitiveConceptRepository.findByIds(userId, conceptIds);
        }
        else {
            concepts = await this.cognitiveConceptRepository.findByModelId(userId, modelId);
        }
        for (const concept of concepts) {
            const relations = await this.cognitiveRelationRepository.findByConceptId(userId, concept.id);
            if (relations.length < 2) {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: cognitive_feedback_1.CognitiveInsightType.CONCEPT_INSIGHT,
                    title: `概念 ${concept.name} 关系不足`,
                    description: `概念 ${concept.name} 目前只有 ${relations.length} 个关系，建议添加更多相关关系以丰富认知结构。`,
                    importance: 0.7,
                    confidence: 0.9,
                    relatedConceptIds: [concept.id],
                    suggestions: [
                        `为概念 ${concept.name} 添加更多相关概念和关系`,
                        `考虑 ${concept.name} 与其他核心概念之间的潜在关系`,
                        `使用扩展思考法探索 ${concept.name} 的不同方面`
                    ],
                    createdAt: new Date()
                });
            }
            if (concept.importance < 0.5) {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: cognitive_feedback_1.CognitiveInsightType.CONCEPT_INSIGHT,
                    title: `概念 ${concept.name} 重要性较低`,
                    description: `概念 ${concept.name} 的重要性评分为 ${concept.importance}，可能需要重新评估其在认知模型中的地位。`,
                    importance: 0.6,
                    confidence: 0.85,
                    relatedConceptIds: [concept.id],
                    suggestions: [
                        `重新评估概念 ${concept.name} 的重要性`,
                        `考虑是否需要调整概念 ${concept.name} 在模型中的位置`,
                        `检查概念 ${concept.name} 与其他概念的关联程度`
                    ],
                    createdAt: new Date()
                });
            }
        }
        return insights;
    }
    async generateRelationInsights(userId, modelId, relationIds) {
        const insights = [];
        let relations;
        if (relationIds.length > 0) {
            relations = await this.cognitiveRelationRepository.findByIds(userId, relationIds);
        }
        else {
            relations = await this.cognitiveRelationRepository.findByModelId(userId, modelId);
        }
        for (const relation of relations) {
            if (relation.strength < 0.5) {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: cognitive_feedback_1.CognitiveInsightType.RELATION_INSIGHT,
                    title: `关系 ${relation.id} 强度较弱`,
                    description: `关系 ${relation.sourceConceptId} - ${relation.targetConceptId} 的强度为 ${relation.strength}，建议加强或重新评估。`,
                    importance: 0.65,
                    confidence: 0.85,
                    relatedRelationIds: [relation.id],
                    suggestions: [
                        `加强关系 ${relation.sourceConceptId} - ${relation.targetConceptId} 的强度`,
                        `重新评估该关系的准确性和重要性`,
                        `考虑是否需要添加更多证据支持该关系`
                    ],
                    createdAt: new Date()
                });
            }
        }
        return insights;
    }
    async generateStructureInsights(userId, modelId) {
        const insights = [];
        const concepts = await this.cognitiveConceptRepository.findByModelId(userId, modelId);
        const relations = await this.cognitiveRelationRepository.findByModelId(userId, modelId);
        const modelDensity = this.calculateModelDensity(concepts.length, relations.length);
        if (modelDensity < 0.3) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_1.CognitiveInsightType.STRUCTURE_INSIGHT,
                title: `认知模型密度较低`,
                description: `当前认知模型的密度为 ${modelDensity.toFixed(2)}，概念之间的连接不够紧密，可能存在结构松散的问题。`,
                importance: 0.8,
                confidence: 0.9,
                suggestions: [
                    `增加概念之间的关系连接`,
                    `探索不同概念之间的潜在关联`,
                    `考虑引入中介概念来连接不同的概念集群`
                ],
                createdAt: new Date()
            });
        }
        else if (modelDensity > 0.8) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_1.CognitiveInsightType.STRUCTURE_INSIGHT,
                title: `认知模型密度较高`,
                description: `当前认知模型的密度为 ${modelDensity.toFixed(2)}，概念之间的连接过于紧密，可能存在结构冗余的问题。`,
                importance: 0.7,
                confidence: 0.85,
                suggestions: [
                    `精简不必要的关系连接`,
                    `对概念进行分类和分层`,
                    `识别并保留核心关系，删除次要关系`
                ],
                createdAt: new Date()
            });
        }
        return insights;
    }
    async generateEvolutionInsights(userId, modelId) {
        const insights = [];
        const trendResult = await this.evolutionAnalysisService.analyzeEvolutionTrends(userId, {
            includePredictions: true
        });
        if (trendResult.metrics.evolutionSpeedTrend.values.some(speed => speed > 15)) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_1.CognitiveInsightType.EVOLUTION_INSIGHT,
                title: `认知模型演化速度较快`,
                description: `您的认知模型演化速度较快，最近的演化速度超过了正常范围，建议定期进行模型审查和优化。`,
                importance: 0.85,
                confidence: 0.9,
                suggestions: [
                    `定期进行认知模型审查`,
                    `关注模型的一致性和完整性`,
                    `考虑引入版本控制来管理模型演化`
                ],
                createdAt: new Date()
            });
        }
        if (trendResult.metrics.consistencyScoreTrend.values.some(score => score < 0.8)) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_1.CognitiveInsightType.EVOLUTION_INSIGHT,
                title: `认知模型一致性波动`,
                description: `您的认知模型一致性最近出现了波动，部分时期的一致性得分低于0.8，建议关注模型质量。`,
                importance: 0.8,
                confidence: 0.85,
                suggestions: [
                    `检查模型中的不一致之处`,
                    `加强模型验证和审核流程`,
                    `考虑使用自动化工具检测模型一致性`
                ],
                createdAt: new Date()
            });
        }
        return insights;
    }
    async getInsights(userId, modelId, options) {
        return this.generateInsights(userId, modelId, {
            insightTypes: options?.insightTypes,
            importanceThreshold: options?.importanceThreshold,
            confidenceThreshold: options?.confidenceThreshold,
            maxInsights: options?.limit
        });
    }
    async getInsightById(userId, insightId) {
        return null;
    }
    async updateInsight(userId, insightId, updateData) {
        throw new Error('Not implemented');
    }
    async deleteInsight(userId, insightId) {
        return true;
    }
    calculateModelDensity(conceptCount, relationCount) {
        if (conceptCount <= 1)
            return 0;
        const maxPossibleRelations = conceptCount * (conceptCount - 1);
        return relationCount / maxPossibleRelations;
    }
}
exports.InsightGenerationServiceImpl = InsightGenerationServiceImpl;
//# sourceMappingURL=insight-generation-service-impl.js.map