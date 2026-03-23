"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightGenerationServiceImpl = void 0;
const insight_generation_service_1 = require("./insight-generation-service");
const uuid_1 = require("uuid");
const cognitive_model_1 = require("../../../domain/entities/cognitive-model");
class InsightGenerationServiceImpl {
    cognitiveModelRepository;
    evolutionAnalysisService;
    cacheService;
    constructor(cognitiveModelRepository, evolutionAnalysisService, cacheService) {
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.evolutionAnalysisService = evolutionAnalysisService;
        this.cacheService = cacheService;
    }
    async generateInsights(param1, param2, param3) {
        if (param1 instanceof cognitive_model_1.CognitiveModel && Array.isArray(param2) && Array.isArray(param3)) {
            const model = param1;
            const concepts = param2;
            const relations = param3;
            const cacheKey = `insights:test:${model.id}:${concepts.length}:${relations.length}`;
            const cachedInsights = await this.cacheService.get(cacheKey);
            if (cachedInsights) {
                return cachedInsights;
            }
            const insights = [];
            const conceptInsights = this.generateConceptInsights(model, undefined, concepts);
            insights.push(...conceptInsights);
            const relationInsights = this.generateRelationInsights(model, undefined, relations, concepts);
            insights.push(...relationInsights);
            const structureInsights = this.generateStructureInsights(model, undefined, concepts, relations);
            insights.push(...structureInsights);
            const evolutionInsights = this.generateEvolutionInsights(model, {}, undefined);
            insights.push(...evolutionInsights);
            await this.cacheService.set(cacheKey, insights, 5 * 60 * 1000);
            return insights;
        }
        const userId = param1;
        const modelId = param2;
        const options = param3;
        const cacheKey = `insights:${userId}:${modelId}:${JSON.stringify(options || {})}`;
        const cachedInsights = await this.cacheService.get(cacheKey);
        if (cachedInsights) {
            return cachedInsights;
        }
        const modelData = await this.cognitiveModelRepository.getModelWithDetails(modelId, userId);
        if (!modelData) {
            throw new Error(`认知模型 ${modelId} 不存在`);
        }
        const { model, concepts, relations } = modelData;
        const evolutionData = await this.evolutionAnalysisService.analyzeEvolutionTrends(userId);
        const insights = [];
        const conceptInsights = this.generateConceptInsights(model, options, concepts);
        insights.push(...conceptInsights);
        const relationInsights = this.generateRelationInsights(model, options, relations, concepts);
        insights.push(...relationInsights);
        const structureInsights = this.generateStructureInsights(model, options, concepts, relations);
        insights.push(...structureInsights);
        const evolutionInsights = this.generateEvolutionInsights(model, evolutionData, options);
        insights.push(...evolutionInsights);
        const filteredInsights = this.filterAndSortInsights(insights, options);
        await this.cacheService.set(cacheKey, filteredInsights, 5 * 60 * 1000);
        return filteredInsights;
    }
    async generateInsightsFromConcepts(userId, modelId, conceptIds, options) {
        const modelData = await this.cognitiveModelRepository.getModelWithDetails(modelId, userId);
        if (!modelData) {
            throw new Error(`认知模型 ${modelId} 不存在`);
        }
        const { model, concepts } = modelData;
        const targetConcepts = concepts.filter(concept => conceptIds.includes(concept.id));
        if (targetConcepts.length === 0) {
            return [];
        }
        const insights = this.generateConceptInsights(model, options, targetConcepts);
        return this.filterAndSortInsights(insights, options);
    }
    async generateInsightsFromRelations(userId, modelId, relationIds, options) {
        const modelData = await this.cognitiveModelRepository.getModelWithDetails(modelId, userId);
        if (!modelData) {
            throw new Error(`认知模型 ${modelId} 不存在`);
        }
        const { model, relations, concepts } = modelData;
        const targetRelations = relations.filter(relation => relationIds.includes(relation.id));
        if (targetRelations.length === 0) {
            return [];
        }
        const insights = this.generateRelationInsights(model, options, targetRelations, concepts);
        return this.filterAndSortInsights(insights, options);
    }
    async generateInsightsFromEvolution(userId, modelId, evolutionData, options) {
        const model = await this.cognitiveModelRepository.findById(modelId, userId);
        if (!model) {
            throw new Error(`认知模型 ${modelId} 不存在`);
        }
        const insights = this.generateEvolutionInsights(model, evolutionData, options);
        return this.filterAndSortInsights(insights, options);
    }
    generateConceptInsights(model, options, targetConcepts) {
        const concepts = targetConcepts || [];
        const insights = [];
        if (concepts.length === 0) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.CONCEPT_INSIGHT,
                title: '认知模型缺少概念',
                description: '当前认知模型中没有任何概念，建议添加一些核心概念来构建认知结构。',
                importance: 8,
                confidence: 1.0,
                suggestions: [
                    '添加1-3个核心概念作为认知模型的基础',
                    '从您最关注的主题开始构建概念体系',
                    '考虑概念之间的层次关系'
                ],
                createdAt: new Date()
            });
        }
        else if (concepts.length < 5) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.CONCEPT_INSIGHT,
                title: '概念数量较少',
                description: `当前认知模型中只有 ${concepts.length} 个概念，建议继续扩展以构建更完整的认知结构。`,
                importance: 6,
                confidence: 0.9,
                suggestions: [
                    '基于现有概念扩展相关子概念',
                    '考虑添加对立或相关概念以丰富认知结构',
                    '从不同角度思考同一主题，添加新的概念'
                ],
                createdAt: new Date()
            });
        }
        else {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.CONCEPT_INSIGHT,
                title: '概念体系初步形成',
                description: `当前认知模型已包含 ${concepts.length} 个概念，概念体系初步形成。`,
                importance: 5,
                confidence: 0.9,
                suggestions: [
                    '检查概念之间的关系是否完整',
                    '考虑概念的层次结构是否合理',
                    '识别并添加缺失的关键概念'
                ],
                createdAt: new Date()
            });
        }
        const conceptsWithProperties = concepts.filter(concept => Object.keys(concept.attributes || {}).length > 0);
        if (conceptsWithProperties.length < concepts.length * 0.5) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.CONCEPT_INSIGHT,
                title: '概念属性不完整',
                description: '大部分概念缺少属性定义，建议为概念添加更多属性以丰富认知模型。',
                importance: 7,
                confidence: 0.8,
                suggestions: [
                    '为核心概念添加描述性属性',
                    '考虑为概念添加权重或重要性属性',
                    '添加概念的来源或创建时间等元数据'
                ],
                createdAt: new Date()
            });
        }
        return insights;
    }
    generateRelationInsights(model, options, targetRelations, targetConcepts) {
        const relations = targetRelations || [];
        const concepts = targetConcepts || [];
        const insights = [];
        if (relations.length === 0) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.RELATION_INSIGHT,
                title: '认知模型缺少关系',
                description: '当前认知模型中没有任何概念之间的关系，建议添加关系以构建完整的认知网络。',
                importance: 9,
                confidence: 1.0,
                suggestions: [
                    '在相关概念之间添加关联关系',
                    '考虑不同类型的关系（如层级、因果、关联等）',
                    '从核心概念开始构建关系网络'
                ],
                createdAt: new Date()
            });
        }
        else {
            const relationDensity = relations.length / (concepts.length * (concepts.length - 1));
            if (relationDensity < 0.1) {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: insight_generation_service_1.CognitiveInsightType.RELATION_INSIGHT,
                    title: '关系密度较低',
                    description: `当前认知模型的关系密度为 ${relationDensity.toFixed(2)}，概念之间的连接较少。`,
                    importance: 7,
                    confidence: 0.9,
                    suggestions: [
                        '在相关概念之间添加更多关系',
                        '检查是否存在孤立的概念',
                        '考虑添加跨领域的关系以扩展认知模型'
                    ],
                    createdAt: new Date()
                });
            }
            else {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: insight_generation_service_1.CognitiveInsightType.RELATION_INSIGHT,
                    title: '关系网络良好',
                    description: `当前认知模型的关系密度为 ${relationDensity.toFixed(2)}，概念之间连接较为紧密。`,
                    importance: 4,
                    confidence: 0.8,
                    suggestions: [
                        '优化现有关系的类型和描述',
                        '考虑关系的强度和方向',
                        '添加关系的置信度或权重'
                    ],
                    createdAt: new Date()
                });
            }
        }
        const relationTypes = new Set(relations.map(relation => relation.type));
        if (relationTypes.size === 1 && relations.length > 5) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.RELATION_INSIGHT,
                title: '关系类型单一',
                description: `当前认知模型中只有 ${Array.from(relationTypes)[0]} 一种关系类型，建议添加更多类型的关系。`,
                importance: 6,
                confidence: 0.8,
                suggestions: [
                    '添加不同类型的关系（如层级、因果、关联等）',
                    '考虑关系的方向性和强度',
                    '使用更具体的关系类型描述概念间的联系'
                ],
                createdAt: new Date()
            });
        }
        return insights;
    }
    generateStructureInsights(model, options, concepts, relations) {
        const insights = [];
        const modelConcepts = concepts || [];
        const modelRelations = relations || [];
        const connectedConceptIds = new Set();
        modelRelations.forEach(relation => {
            connectedConceptIds.add(relation.sourceId);
            connectedConceptIds.add(relation.targetId);
        });
        const isolatedConcepts = modelConcepts.filter(concept => !connectedConceptIds.has(concept.id));
        if (isolatedConcepts.length > 0) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.STRUCTURE_INSIGHT,
                title: '存在孤立概念',
                description: `当前认知模型中有 ${isolatedConcepts.length} 个孤立概念，它们与其他概念没有任何关系。`,
                importance: 7,
                confidence: 1.0,
                relatedConceptIds: isolatedConcepts.map(concept => concept.id),
                suggestions: [
                    '在孤立概念和其他相关概念之间添加关系',
                    '考虑孤立概念是否应该属于当前认知模型',
                    '如果是新添加的概念，尝试建立与现有概念的联系'
                ],
                createdAt: new Date()
            });
        }
        const complexity = modelConcepts.length + modelRelations.length;
        if (complexity > 50) {
            insights.push({
                id: (0, uuid_1.v4)(),
                type: insight_generation_service_1.CognitiveInsightType.STRUCTURE_INSIGHT,
                title: '认知模型较为复杂',
                description: `当前认知模型包含 ${modelConcepts.length} 个概念和 ${modelRelations.length} 个关系，结构较为复杂。`,
                importance: 5,
                confidence: 0.9,
                suggestions: [
                    '考虑将模型拆分为多个子模型',
                    '优化概念的层级结构',
                    '检查并删除冗余的关系'
                ],
                createdAt: new Date()
            });
        }
        return insights;
    }
    generateEvolutionInsights(model, evolutionData, options) {
        const insights = [];
        if (evolutionData && evolutionData.evolutionTrend) {
            const trend = evolutionData.evolutionTrend;
            if (trend === 'growing') {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: insight_generation_service_1.CognitiveInsightType.EVOLUTION_INSIGHT,
                    title: '认知模型正在增长',
                    description: '您的认知模型正在不断增长，新的概念和关系正在被添加。',
                    importance: 5,
                    confidence: 0.9,
                    suggestions: [
                        '继续添加相关概念和关系',
                        '定期审查模型结构，确保其保持清晰',
                        '考虑添加主题标签来组织概念'
                    ],
                    createdAt: new Date()
                });
            }
            else if (trend === 'stable') {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: insight_generation_service_1.CognitiveInsightType.EVOLUTION_INSIGHT,
                    title: '认知模型趋于稳定',
                    description: '您的认知模型已趋于稳定，没有显著的增长或变化。',
                    importance: 4,
                    confidence: 0.8,
                    suggestions: [
                        '考虑扩展现有概念的属性',
                        '添加新的关系类型',
                        '从不同角度分析现有概念'
                    ],
                    createdAt: new Date()
                });
            }
        }
        if (evolutionData && evolutionData.conceptEvolution) {
            const newConcepts = evolutionData.conceptEvolution.newConcepts || [];
            if (newConcepts.length > 0) {
                insights.push({
                    id: (0, uuid_1.v4)(),
                    type: insight_generation_service_1.CognitiveInsightType.EVOLUTION_INSIGHT,
                    title: '新增概念分析',
                    description: `最近新增了 ${newConcepts.length} 个概念，丰富了认知模型的内容。`,
                    importance: 6,
                    confidence: 0.9,
                    relatedConceptIds: newConcepts,
                    suggestions: [
                        '为新增概念添加相关关系',
                        '考虑新增概念在模型中的位置和作用',
                        '检查新增概念与现有概念的一致性'
                    ],
                    createdAt: new Date()
                });
            }
        }
        return insights;
    }
    filterAndSortInsights(insights, options) {
        let filteredInsights = [...insights];
        if (options?.insightTypes && options.insightTypes.length > 0) {
            filteredInsights = filteredInsights.filter(insight => options.insightTypes?.includes(insight.type));
        }
        if (options?.importanceThreshold !== undefined) {
            filteredInsights = filteredInsights.filter(insight => insight.importance >= options.importanceThreshold);
        }
        if (options?.confidenceThreshold !== undefined) {
            filteredInsights = filteredInsights.filter(insight => insight.confidence >= options.confidenceThreshold);
        }
        filteredInsights.sort((a, b) => {
            if (a.importance !== b.importance) {
                return b.importance - a.importance;
            }
            return b.confidence - a.confidence;
        });
        if (options?.maxInsights !== undefined) {
            filteredInsights = filteredInsights.slice(0, options.maxInsights);
        }
        if (options?.includeSuggestions === false) {
            filteredInsights = filteredInsights.map(insight => ({
                ...insight,
                suggestions: []
            }));
        }
        return filteredInsights;
    }
}
exports.InsightGenerationServiceImpl = InsightGenerationServiceImpl;
//# sourceMappingURL=insight-generation-service-impl.js.map