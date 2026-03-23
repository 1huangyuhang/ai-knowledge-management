"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveFeedbackServiceImpl = exports.FeedbackFormattingServiceImpl = exports.GapIdentificationServiceImpl = exports.BlindspotDetectionServiceImpl = exports.ThemeAnalysisServiceImpl = exports.InsightGenerationServiceImpl = void 0;
const uuid_1 = require("uuid");
const cognitive_feedback_service_1 = require("./cognitive-feedback-service");
class InsightGenerationServiceImpl {
    cognitiveModelService;
    cognitiveInsightRepository;
    constructor(cognitiveModelService, cognitiveInsightRepository) {
        this.cognitiveModelService = cognitiveModelService;
        this.cognitiveInsightRepository = cognitiveInsightRepository;
    }
    async generateInsights(userId, model) {
        const insight = this.cognitiveModelService.generateInsight(model);
        await this.cognitiveInsightRepository.createCognitiveInsight(userId, insight);
        return {
            id: `insight-result-${(0, uuid_1.v4)()}`,
            insights: [insight],
            generatedAt: new Date(),
            confidence: insight.confidence || 0.8
        };
    }
    async generateInsightsByTheme(userId, model, themeId) {
        const themeConcepts = model.concepts.filter(concept => concept.id === themeId ||
            model.relations.some(relation => relation.sourceConceptId === themeId || relation.targetConceptId === themeId));
        const themeModel = {
            ...model,
            concepts: themeConcepts
        };
        const insight = this.cognitiveModelService.generateInsight(themeModel);
        await this.cognitiveInsightRepository.createCognitiveInsight(userId, insight);
        return {
            id: `insight-result-${(0, uuid_1.v4)()}`,
            insights: [insight],
            generatedAt: new Date(),
            confidence: insight.confidence || 0.8
        };
    }
    async generateBatchInsights(userId, models) {
        const results = [];
        for (const model of models) {
            const result = await this.generateInsights(userId, model);
            results.push(result);
        }
        return results;
    }
}
exports.InsightGenerationServiceImpl = InsightGenerationServiceImpl;
class ThemeAnalysisServiceImpl {
    async analyzeCoreThemes(userId, model) {
        const conceptRelationCount = new Map();
        model.relations.forEach(relation => {
            const sourceCount = conceptRelationCount.get(relation.sourceConceptId) || 0;
            conceptRelationCount.set(relation.sourceConceptId, sourceCount + 1);
            const targetCount = conceptRelationCount.get(relation.targetConceptId) || 0;
            conceptRelationCount.set(relation.targetConceptId, targetCount + 1);
        });
        const sortedConcepts = [...model.concepts]
            .sort((a, b) => {
            const aScore = a.confidenceScore * 0.6 + (conceptRelationCount.get(a.id) || 0) * 0.4;
            const bScore = b.confidenceScore * 0.6 + (conceptRelationCount.get(b.id) || 0) * 0.4;
            return bScore - aScore;
        })
            .slice(0, 5);
        const coreThemes = sortedConcepts.map(concept => {
            const relatedConcepts = model.concepts.filter(relatedConcept => relatedConcept.id !== concept.id &&
                model.relations.some(relation => (relation.sourceConceptId === concept.id && relation.targetConceptId === relatedConcept.id) ||
                    (relation.targetConceptId === concept.id && relation.sourceConceptId === relatedConcept.id)));
            return {
                id: concept.id,
                name: concept.semanticIdentity,
                description: `核心主题：${concept.semanticIdentity}`,
                relatedConcepts,
                weight: concept.confidenceScore * 0.8 + (conceptRelationCount.get(concept.id) || 0) * 0.2,
                confidence: concept.confidenceScore
            };
        });
        const themeNetwork = await this.buildThemeNetwork(userId, coreThemes, model.relations);
        return {
            id: `theme-analysis-${(0, uuid_1.v4)()}`,
            coreThemes,
            themeNetwork,
            analyzedAt: new Date()
        };
    }
    async buildThemeNetwork(userId, themes, relations) {
        const themeRelations = [];
        const themeRelationStrength = new Map();
        relations.forEach(relation => {
            const sourceTheme = themes.find(theme => theme.id === relation.sourceConceptId);
            const targetTheme = themes.find(theme => theme.id === relation.targetConceptId);
            if (sourceTheme && targetTheme) {
                const key = `${sourceTheme.id}-${targetTheme.id}`;
                const strength = themeRelationStrength.get(key) || 0;
                themeRelationStrength.set(key, strength + relation.confidenceScore);
            }
        });
        themeRelationStrength.forEach((strength, key) => {
            const [sourceThemeId, targetThemeId] = key.split('-');
            themeRelations.push({
                sourceThemeId,
                targetThemeId,
                relationType: 'RELATED',
                strength: Math.min(strength, 1.0)
            });
        });
        return themeRelations;
    }
    async updateThemeWeight(userId, themeId, weight) {
        return {
            id: themeId,
            name: 'Updated Theme',
            description: 'Updated theme description',
            relatedConcepts: [],
            weight: Math.min(Math.max(weight, 0), 1),
            confidence: 0.8
        };
    }
}
exports.ThemeAnalysisServiceImpl = ThemeAnalysisServiceImpl;
class BlindspotDetectionServiceImpl {
    cognitiveModelService;
    constructor(cognitiveModelService) {
        this.cognitiveModelService = cognitiveModelService;
    }
    async detectBlindspots(userId, model) {
        const blindspots = [];
        if (model.concepts.length < 5) {
            blindspots.push(await this.detectConceptMissingBlindspot(model));
        }
        if (model.relations.length < model.concepts.length) {
            blindspots.push(await this.detectRelationMissingBlindspot(model));
        }
        if (!this.hasHierarchyStructure(model)) {
            blindspots.push(await this.detectHierarchyMissingBlindspot(model));
        }
        if (!this.isModelBalanced(model)) {
            blindspots.push(await this.detectBalanceMissingBlindspot(model));
        }
        if (!this.hasAdequateDepth(model)) {
            blindspots.push(await this.detectDepthMissingBlindspot(model));
        }
        const totalConfidence = blindspots.length > 0
            ? blindspots.reduce((sum, blindspot) => sum + blindspot.confidence, 0) / blindspots.length
            : 1.0;
        return {
            id: `blindspot-detection-${(0, uuid_1.v4)()}`,
            blindspots,
            detectedAt: new Date(),
            confidence: totalConfidence
        };
    }
    async detectSpecificBlindspot(userId, model, blindspotType) {
        let blindspot;
        switch (blindspotType) {
            case cognitive_feedback_service_1.BlindspotType.CONCEPT_MISSING:
                if (model.concepts.length < 5) {
                    blindspot = await this.detectConceptMissingBlindspot(model);
                }
                break;
            case cognitive_feedback_service_1.BlindspotType.RELATION_MISSING:
                if (model.relations.length < model.concepts.length) {
                    blindspot = await this.detectRelationMissingBlindspot(model);
                }
                break;
            case cognitive_feedback_service_1.BlindspotType.HIERARCHY_MISSING:
                if (!this.hasHierarchyStructure(model)) {
                    blindspot = await this.detectHierarchyMissingBlindspot(model);
                }
                break;
            case cognitive_feedback_service_1.BlindspotType.BALANCE_MISSING:
                if (!this.isModelBalanced(model)) {
                    blindspot = await this.detectBalanceMissingBlindspot(model);
                }
                break;
            case cognitive_feedback_service_1.BlindspotType.DEPTH_MISSING:
                if (!this.hasAdequateDepth(model)) {
                    blindspot = await this.detectDepthMissingBlindspot(model);
                }
                break;
        }
        return {
            id: `blindspot-detection-${(0, uuid_1.v4)()}`,
            blindspots: blindspot ? [blindspot] : [],
            detectedAt: new Date(),
            confidence: blindspot ? blindspot.confidence : 1.0
        };
    }
    async evaluateBlindspotImpact(userId, blindspot) {
        let impactScore = 0;
        let impactDescription = '';
        switch (blindspot.type) {
            case cognitive_feedback_service_1.BlindspotType.CONCEPT_MISSING:
            case cognitive_feedback_service_1.BlindspotType.RELATION_MISSING:
                impactScore = 0.7;
                impactDescription = '影响认知模型的完整性和连接性';
                break;
            case cognitive_feedback_service_1.BlindspotType.HIERARCHY_MISSING:
                impactScore = 0.8;
                impactDescription = '影响认知模型的结构清晰度和逻辑关系';
                break;
            case cognitive_feedback_service_1.BlindspotType.BALANCE_MISSING:
                impactScore = 0.6;
                impactDescription = '影响认知模型的平衡性和全面性';
                break;
            case cognitive_feedback_service_1.BlindspotType.DEPTH_MISSING:
                impactScore = 0.5;
                impactDescription = '影响认知模型的深度和详细程度';
                break;
        }
        switch (blindspot.severity) {
            case cognitive_feedback_service_1.SeverityLevel.HIGH:
                impactScore *= 1.2;
                break;
            case cognitive_feedback_service_1.SeverityLevel.MEDIUM:
                impactScore *= 1.0;
                break;
            case cognitive_feedback_service_1.SeverityLevel.LOW:
                impactScore *= 0.8;
                break;
        }
        switch (blindspot.impactScope) {
            case cognitive_feedback_service_1.ImpactScope.CRITICAL:
                impactScore *= 1.3;
                break;
            case cognitive_feedback_service_1.ImpactScope.GLOBAL:
                impactScore *= 1.1;
                break;
            case cognitive_feedback_service_1.ImpactScope.LOCAL:
                impactScore *= 0.9;
                break;
        }
        impactScore = Math.min(Math.max(impactScore, 0), 1);
        return {
            impactScore,
            impactDescription
        };
    }
    async detectConceptMissingBlindspot(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.BlindspotType.CONCEPT_MISSING,
            description: '认知模型概念数量较少，建议增加更多概念',
            relatedConcepts: [],
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: model.concepts.length === 0 ? cognitive_feedback_service_1.SeverityLevel.HIGH : cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.9,
            suggestions: [
                '尝试添加与核心主题相关的新概念',
                '考虑从不同角度扩展现有概念',
                '通过思想片段记录添加更多相关概念'
            ]
        };
    }
    async detectRelationMissingBlindspot(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.BlindspotType.RELATION_MISSING,
            description: '认知模型关系数量较少，建议增加更多关系',
            relatedConcepts: [],
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.85,
            suggestions: [
                '思考现有概念之间的潜在联系',
                '添加不同概念之间的关系',
                '强化核心概念之间的连接'
            ]
        };
    }
    async detectHierarchyMissingBlindspot(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.BlindspotType.HIERARCHY_MISSING,
            description: '认知模型缺乏清晰的层次结构，建议建立概念之间的层级关系',
            relatedConcepts: [],
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: cognitive_feedback_service_1.SeverityLevel.HIGH,
            confidence: 0.9,
            suggestions: [
                '识别核心概念作为父概念',
                '建立子概念与父概念之间的关系',
                '形成清晰的概念层级结构'
            ]
        };
    }
    async detectBalanceMissingBlindspot(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.BlindspotType.BALANCE_MISSING,
            description: '认知模型各部分发展不平衡，建议平衡各概念领域',
            relatedConcepts: [],
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.8,
            suggestions: [
                '识别发展不足的概念领域',
                '增加对薄弱领域的关注',
                '平衡各概念之间的关系'
            ]
        };
    }
    async detectDepthMissingBlindspot(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.BlindspotType.DEPTH_MISSING,
            description: '认知模型缺乏足够的深度，建议深入探索核心概念',
            relatedConcepts: [],
            impactScope: cognitive_feedback_service_1.ImpactScope.LOCAL,
            severity: cognitive_feedback_service_1.SeverityLevel.LOW,
            confidence: 0.75,
            suggestions: [
                '深入探索核心概念的细节',
                '添加更具体的子概念',
                '丰富概念的属性和特征'
            ]
        };
    }
    hasHierarchyStructure(model) {
        return model.relations.some(relation => relation.relationType === 'PARENT_CHILD');
    }
    isModelBalanced(model) {
        if (model.concepts.length === 0)
            return true;
        const relationToConceptRatio = model.relations.length / model.concepts.length;
        return relationToConceptRatio >= 0.8 && relationToConceptRatio <= 2.0;
    }
    hasAdequateDepth(model) {
        if (model.concepts.length < 3)
            return true;
        const avgRelationsPerConcept = model.relations.length / model.concepts.length;
        return avgRelationsPerConcept >= 1.5;
    }
}
exports.BlindspotDetectionServiceImpl = BlindspotDetectionServiceImpl;
class GapIdentificationServiceImpl {
    cognitiveModelService;
    constructor(cognitiveModelService) {
        this.cognitiveModelService = cognitiveModelService;
    }
    async identifyGaps(userId, model) {
        const gaps = [];
        if (model.concepts.length < 5) {
            gaps.push(await this.identifyKnowledgeGap(model));
        }
        if (model.relations.length < model.concepts.length) {
            gaps.push(await this.identifyUnderstandingGap(model));
        }
        if (!this.hasApplicationRelations(model)) {
            gaps.push(await this.identifyApplicationGap(model));
        }
        if (!this.hasDiverseRelations(model)) {
            gaps.push(await this.identifyConnectionGap(model));
        }
        if (!this.hasDiverseConcepts(model)) {
            gaps.push(await this.identifyPerspectiveGap(model));
        }
        const totalConfidence = gaps.length > 0
            ? gaps.reduce((sum, gap) => sum + gap.confidence, 0) / gaps.length
            : 1.0;
        return {
            id: `gap-identification-${(0, uuid_1.v4)()}`,
            gaps,
            identifiedAt: new Date(),
            confidence: totalConfidence
        };
    }
    async compareModelGaps(userId, sourceModel, targetModel) {
        const gaps = [];
        if (sourceModel.concepts.length < targetModel.concepts.length) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_service_1.GapType.KNOWLEDGE_GAP,
                description: `源模型比目标模型少${targetModel.concepts.length - sourceModel.concepts.length}个概念`,
                source: `源模型：${sourceModel.concepts.length}个概念`,
                target: `目标模型：${targetModel.concepts.length}个概念`,
                magnitude: (targetModel.concepts.length - sourceModel.concepts.length) / targetModel.concepts.length,
                impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
                severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
                confidence: 0.95,
                suggestions: [
                    '添加缺失的核心概念',
                    '考虑从目标模型中迁移相关概念',
                    '分析目标模型的概念结构'
                ]
            });
        }
        if (sourceModel.relations.length < targetModel.relations.length) {
            gaps.push({
                id: (0, uuid_1.v4)(),
                type: cognitive_feedback_service_1.GapType.CONNECTION_GAP,
                description: `源模型比目标模型少${targetModel.relations.length - sourceModel.relations.length}个关系`,
                source: `源模型：${sourceModel.relations.length}个关系`,
                target: `目标模型：${targetModel.relations.length}个关系`,
                magnitude: (targetModel.relations.length - sourceModel.relations.length) / targetModel.relations.length,
                impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
                severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
                confidence: 0.9,
                suggestions: [
                    '添加缺失的关键关系',
                    '分析目标模型的关系网络',
                    '加强概念之间的连接'
                ]
            });
        }
        const totalConfidence = gaps.length > 0
            ? gaps.reduce((sum, gap) => sum + gap.confidence, 0) / gaps.length
            : 1.0;
        return {
            id: `gap-identification-${(0, uuid_1.v4)()}`,
            gaps,
            identifiedAt: new Date(),
            confidence: totalConfidence
        };
    }
    async evaluateGapMagnitude(userId, gap) {
        let magnitudeScore = gap.magnitude;
        let magnitudeDescription = '';
        switch (gap.type) {
            case cognitive_feedback_service_1.GapType.KNOWLEDGE_GAP:
                magnitudeDescription = '知识差距';
                magnitudeScore *= 1.2;
                break;
            case cognitive_feedback_service_1.GapType.UNDERSTANDING_GAP:
                magnitudeDescription = '理解差距';
                magnitudeScore *= 1.1;
                break;
            case cognitive_feedback_service_1.GapType.APPLICATION_GAP:
                magnitudeDescription = '应用差距';
                magnitudeScore *= 1.0;
                break;
            case cognitive_feedback_service_1.GapType.CONNECTION_GAP:
                magnitudeDescription = '关联差距';
                magnitudeScore *= 0.9;
                break;
            case cognitive_feedback_service_1.GapType.PERSPECTIVE_GAP:
                magnitudeDescription = '视角差距';
                magnitudeScore *= 0.8;
                break;
        }
        switch (gap.severity) {
            case cognitive_feedback_service_1.SeverityLevel.HIGH:
                magnitudeScore *= 1.3;
                break;
            case cognitive_feedback_service_1.SeverityLevel.MEDIUM:
                magnitudeScore *= 1.1;
                break;
            case cognitive_feedback_service_1.SeverityLevel.LOW:
                magnitudeScore *= 0.9;
                break;
        }
        magnitudeScore = Math.min(Math.max(magnitudeScore, 0), 1);
        return {
            magnitudeScore,
            magnitudeDescription
        };
    }
    async identifyKnowledgeGap(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.GapType.KNOWLEDGE_GAP,
            description: '认知模型概念数量不足，存在知识差距',
            source: `当前概念数量：${model.concepts.length}`,
            target: '建议概念数量：至少5个',
            magnitude: model.concepts.length > 0 ? (5 - model.concepts.length) / 5 : 1.0,
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: model.concepts.length === 0 ? cognitive_feedback_service_1.SeverityLevel.HIGH : cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.95,
            suggestions: [
                '添加与核心主题相关的新概念',
                '从不同角度扩展现有概念',
                '通过研究和学习补充相关知识'
            ]
        };
    }
    async identifyUnderstandingGap(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.GapType.UNDERSTANDING_GAP,
            description: '认知模型关系数量不足，存在理解差距',
            source: `当前关系数量：${model.relations.length}`,
            target: `建议关系数量：至少${model.concepts.length}个`,
            magnitude: model.concepts.length > 0 ? (model.concepts.length - model.relations.length) / model.concepts.length : 0,
            impactScope: cognitive_feedback_service_1.ImpactScope.GLOBAL,
            severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.9,
            suggestions: [
                '思考概念之间的逻辑关系',
                '建立概念之间的联系',
                '通过思维导图可视化概念关系'
            ]
        };
    }
    async identifyApplicationGap(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.GapType.APPLICATION_GAP,
            description: '认知模型缺乏应用相关的关系，存在应用差距',
            source: '当前应用关系：0',
            target: '建议：添加应用相关关系',
            magnitude: 0.7,
            impactScope: cognitive_feedback_service_1.ImpactScope.LOCAL,
            severity: cognitive_feedback_service_1.SeverityLevel.MEDIUM,
            confidence: 0.85,
            suggestions: [
                '添加概念的应用场景关系',
                '思考概念在实际中的应用方式',
                '记录概念的实际应用案例'
            ]
        };
    }
    async identifyConnectionGap(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.GapType.CONNECTION_GAP,
            description: '认知模型关系类型单一，存在关联差距',
            source: '当前关系类型：有限',
            target: '建议：添加多样化的关系类型',
            magnitude: 0.6,
            impactScope: cognitive_feedback_service_1.ImpactScope.LOCAL,
            severity: cognitive_feedback_service_1.SeverityLevel.LOW,
            confidence: 0.8,
            suggestions: [
                '添加不同类型的关系（因果、相似、对比等）',
                '建立跨领域的概念联系',
                '探索概念之间的间接关系'
            ]
        };
    }
    async identifyPerspectiveGap(model) {
        return {
            id: (0, uuid_1.v4)(),
            type: cognitive_feedback_service_1.GapType.PERSPECTIVE_GAP,
            description: '认知模型概念视角单一，存在视角差距',
            source: '当前视角：有限',
            target: '建议：添加多样化的视角',
            magnitude: 0.5,
            impactScope: cognitive_feedback_service_1.ImpactScope.LOCAL,
            severity: cognitive_feedback_service_1.SeverityLevel.LOW,
            confidence: 0.75,
            suggestions: [
                '从不同角度审视现有概念',
                '添加对立或互补的概念',
                '考虑不同人群的视角'
            ]
        };
    }
    hasApplicationRelations(model) {
        return model.relations.some(relation => relation.relationType === 'APPLICATION' || relation.relationType === 'USE_CASE');
    }
    hasDiverseRelations(model) {
        const relationTypes = new Set(model.relations.map(relation => relation.relationType));
        return relationTypes.size >= 2;
    }
    hasDiverseConcepts(model) {
        if (model.concepts.length < 3)
            return false;
        const confidenceValues = model.concepts.map(concept => concept.confidenceScore);
        const minConfidence = Math.min(...confidenceValues);
        const maxConfidence = Math.max(...confidenceValues);
        return maxConfidence - minConfidence >= 0.3;
    }
}
exports.GapIdentificationServiceImpl = GapIdentificationServiceImpl;
class FeedbackFormattingServiceImpl {
    constructor() { }
    async formatFeedback(userId, rawFeedback) {
        const insights = rawFeedback.insights || [];
        const themeAnalysis = rawFeedback.themeAnalysis || null;
        const blindspotDetection = rawFeedback.blindspotDetection || null;
        const gapIdentification = rawFeedback.gapIdentification || null;
        const actionItems = this.generateActionItems(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
        const feedbackType = this.determineFeedbackType(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
        const priority = this.determinePriority(blindspotDetection?.blindspots || [], gapIdentification?.gaps || []);
        const summary = this.generateFeedbackSummary(insights, themeAnalysis, blindspotDetection, gapIdentification);
        const formattedFeedback = {
            title: `认知反馈报告 - ${new Date().toISOString().split('T')[0]}`,
            summary,
            insights,
            themeAnalysis: themeAnalysis || {
                id: (0, uuid_1.v4)(),
                coreThemes: [],
                themeNetwork: [],
                analyzedAt: new Date()
            },
            blindspotDetection: blindspotDetection || {
                id: (0, uuid_1.v4)(),
                blindspots: [],
                detectedAt: new Date(),
                confidence: 1.0
            },
            gapIdentification: gapIdentification || {
                id: (0, uuid_1.v4)(),
                gaps: [],
                identifiedAt: new Date(),
                confidence: 1.0
            },
            actionItems,
            feedbackType,
            priority,
            recommendedChannels: ['应用内通知', '邮件', 'PDF报告']
        };
        return {
            id: `feedback-formatting-${(0, uuid_1.v4)()}`,
            rawFeedback,
            formattedFeedback,
            formattedAt: new Date()
        };
    }
    async generateFeedbackReport(userId, formattedFeedback) {
        return {
            id: `feedback-report-${(0, uuid_1.v4)()}`,
            userId,
            generatedAt: new Date(),
            content: formattedFeedback,
            format: 'json',
            version: '1.0.0'
        };
    }
    async exportFeedback(userId, formattedFeedback, format) {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(formattedFeedback, null, 2);
            case 'text':
                return this.generateTextReport(formattedFeedback);
            case 'pdf':
                return this.generatePdfReport(formattedFeedback);
            default:
                return JSON.stringify(formattedFeedback, null, 2);
        }
    }
    generateActionItems(blindspots, gaps) {
        const actionItems = [];
        blindspots.forEach(blindspot => {
            blindspot.suggestions.forEach((suggestion, index) => {
                actionItems.push({
                    id: `action-item-${(0, uuid_1.v4)()}`,
                    description: suggestion,
                    type: this.mapBlindspotTypeToActionItemType(blindspot.type),
                    priority: this.mapSeverityToPriority(blindspot.severity),
                    suggestedTimeframe: '1-2周',
                    expectedOutcome: `解决${blindspot.description}问题`,
                    relatedResources: []
                });
            });
        });
        gaps.forEach(gap => {
            gap.suggestions.forEach((suggestion, index) => {
                actionItems.push({
                    id: `action-item-${(0, uuid_1.v4)()}`,
                    description: suggestion,
                    type: this.mapGapTypeToActionItemType(gap.type),
                    priority: this.mapSeverityToPriority(gap.severity),
                    suggestedTimeframe: '2-4周',
                    expectedOutcome: `缩小${gap.description}差距`,
                    relatedResources: []
                });
            });
        });
        return actionItems.sort((a, b) => {
            const priorityOrder = { [cognitive_feedback_service_1.PriorityLevel.URGENT]: 0, [cognitive_feedback_service_1.PriorityLevel.HIGH]: 1, [cognitive_feedback_service_1.PriorityLevel.MEDIUM]: 2, [cognitive_feedback_service_1.PriorityLevel.LOW]: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    determineFeedbackType(blindspots, gaps) {
        const hasHighSeverity = blindspots.some(b => b.severity === cognitive_feedback_service_1.SeverityLevel.HIGH) ||
            gaps.some(g => g.severity === cognitive_feedback_service_1.SeverityLevel.HIGH);
        if (hasHighSeverity) {
            return cognitive_feedback_service_1.FeedbackType.WARNING;
        }
        const hasMediumSeverity = blindspots.some(b => b.severity === cognitive_feedback_service_1.SeverityLevel.MEDIUM) ||
            gaps.some(g => g.severity === cognitive_feedback_service_1.SeverityLevel.MEDIUM);
        if (hasMediumSeverity) {
            return cognitive_feedback_service_1.FeedbackType.SUGGESTION;
        }
        return cognitive_feedback_service_1.FeedbackType.INSIGHT;
    }
    determinePriority(blindspots, gaps) {
        const hasHighSeverity = blindspots.some(b => b.severity === cognitive_feedback_service_1.SeverityLevel.HIGH) ||
            gaps.some(g => g.severity === cognitive_feedback_service_1.SeverityLevel.HIGH);
        if (hasHighSeverity) {
            return cognitive_feedback_service_1.PriorityLevel.HIGH;
        }
        const hasMediumSeverity = blindspots.some(b => b.severity === cognitive_feedback_service_1.SeverityLevel.MEDIUM) ||
            gaps.some(g => g.severity === cognitive_feedback_service_1.SeverityLevel.MEDIUM);
        if (hasMediumSeverity) {
            return cognitive_feedback_service_1.PriorityLevel.MEDIUM;
        }
        return cognitive_feedback_service_1.PriorityLevel.LOW;
    }
    generateFeedbackSummary(insights, themeAnalysis, blindspotDetection, gapIdentification) {
        let summary = '';
        if (insights.length > 0) {
            summary += `本次分析生成了${insights.length}个认知洞察。`;
        }
        if (themeAnalysis && themeAnalysis.coreThemes && themeAnalysis.coreThemes.length > 0) {
            summary += ` 识别出${themeAnalysis.coreThemes.length}个核心主题，`;
        }
        if (blindspotDetection && blindspotDetection.blindspots && blindspotDetection.blindspots.length > 0) {
            summary += ` 发现${blindspotDetection.blindspots.length}个认知盲点，`;
        }
        if (gapIdentification && gapIdentification.gaps && gapIdentification.gaps.length > 0) {
            summary += ` 识别出${gapIdentification.gaps.length}个认知差距。`;
        }
        if (summary === '') {
            summary = '您的认知模型整体健康，未发现明显的盲点或差距。';
        }
        return summary;
    }
    generateTextReport(formattedFeedback) {
        let report = `# 认知反馈报告\n\n`;
        report += `## 报告信息\n`;
        report += `标题：${formattedFeedback.title}\n`;
        report += `类型：${formattedFeedback.feedbackType}\n`;
        report += `优先级：${formattedFeedback.priority}\n\n`;
        report += `## 摘要\n`;
        report += `${formattedFeedback.summary}\n\n`;
        if (formattedFeedback.insights.length > 0) {
            report += `## 核心洞察\n`;
            formattedFeedback.insights.forEach((insight, index) => {
                report += `${index + 1}. ${insight.title}\n`;
                report += `   ${insight.description}\n\n`;
            });
        }
        if (formattedFeedback.actionItems.length > 0) {
            report += `## 建议行动项\n`;
            formattedFeedback.actionItems.forEach((actionItem, index) => {
                report += `${index + 1}. [${actionItem.priority}] ${actionItem.description}\n`;
                report += `   类型：${actionItem.type}\n`;
                report += `   建议执行时间：${actionItem.suggestedTimeframe}\n`;
                report += `   预期效果：${actionItem.expectedOutcome}\n\n`;
            });
        }
        return report;
    }
    generatePdfReport(formattedFeedback) {
        return {
            type: 'pdf',
            content: formattedFeedback,
            metadata: {
                title: formattedFeedback.title,
                author: 'AI认知辅助系统',
                created: new Date()
            }
        };
    }
    mapBlindspotTypeToActionItemType(blindspotType) {
        switch (blindspotType) {
            case cognitive_feedback_service_1.BlindspotType.CONCEPT_MISSING:
            case cognitive_feedback_service_1.BlindspotType.RELATION_MISSING:
                return cognitive_feedback_service_1.ActionItemType.LEARN;
            case cognitive_feedback_service_1.BlindspotType.HIERARCHY_MISSING:
                return cognitive_feedback_service_1.ActionItemType.REFLECT;
            case cognitive_feedback_service_1.BlindspotType.BALANCE_MISSING:
                return cognitive_feedback_service_1.ActionItemType.CONNECT;
            case cognitive_feedback_service_1.BlindspotType.DEPTH_MISSING:
                return cognitive_feedback_service_1.ActionItemType.EXPLORE;
            default:
                return cognitive_feedback_service_1.ActionItemType.LEARN;
        }
    }
    mapGapTypeToActionItemType(gapType) {
        switch (gapType) {
            case cognitive_feedback_service_1.GapType.KNOWLEDGE_GAP:
                return cognitive_feedback_service_1.ActionItemType.LEARN;
            case cognitive_feedback_service_1.GapType.UNDERSTANDING_GAP:
                return cognitive_feedback_service_1.ActionItemType.REFLECT;
            case cognitive_feedback_service_1.GapType.APPLICATION_GAP:
                return cognitive_feedback_service_1.ActionItemType.APPLY;
            case cognitive_feedback_service_1.GapType.CONNECTION_GAP:
                return cognitive_feedback_service_1.ActionItemType.CONNECT;
            case cognitive_feedback_service_1.GapType.PERSPECTIVE_GAP:
                return cognitive_feedback_service_1.ActionItemType.EXPLORE;
            default:
                return cognitive_feedback_service_1.ActionItemType.LEARN;
        }
    }
    mapSeverityToPriority(severity) {
        switch (severity) {
            case cognitive_feedback_service_1.SeverityLevel.HIGH:
                return cognitive_feedback_service_1.PriorityLevel.HIGH;
            case cognitive_feedback_service_1.SeverityLevel.MEDIUM:
                return cognitive_feedback_service_1.PriorityLevel.MEDIUM;
            case cognitive_feedback_service_1.SeverityLevel.LOW:
                return cognitive_feedback_service_1.PriorityLevel.LOW;
            default:
                return cognitive_feedback_service_1.PriorityLevel.MEDIUM;
        }
    }
}
exports.FeedbackFormattingServiceImpl = FeedbackFormattingServiceImpl;
class CognitiveFeedbackServiceImpl {
    insightGenerationService;
    themeAnalysisService;
    blindspotDetectionService;
    gapIdentificationService;
    feedbackFormattingService;
    constructor(insightGenerationService, themeAnalysisService, blindspotDetectionService, gapIdentificationService, feedbackFormattingService) {
        this.insightGenerationService = insightGenerationService;
        this.themeAnalysisService = themeAnalysisService;
        this.blindspotDetectionService = blindspotDetectionService;
        this.gapIdentificationService = gapIdentificationService;
        this.feedbackFormattingService = feedbackFormattingService;
    }
    async generateCompleteFeedback(userId, model) {
        const insightResult = await this.insightGenerationService.generateInsights(userId, model);
        const themeResult = await this.themeAnalysisService.analyzeCoreThemes(userId, model);
        const blindspotResult = await this.blindspotDetectionService.detectBlindspots(userId, model);
        const gapResult = await this.gapIdentificationService.identifyGaps(userId, model);
        const rawFeedback = {
            insights: insightResult.insights,
            themeAnalysis: themeResult,
            blindspotDetection: blindspotResult,
            gapIdentification: gapResult
        };
        return await this.feedbackFormattingService.formatFeedback(userId, rawFeedback);
    }
}
exports.CognitiveFeedbackServiceImpl = CognitiveFeedbackServiceImpl;
//# sourceMappingURL=cognitive-feedback-service-impl.js.map