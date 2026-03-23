"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlindspotDetectionServiceImpl = void 0;
const uuid_1 = require("uuid");
class BlindspotDetectionServiceImpl {
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
    async detectBlindspots(userId, modelId, options) {
        const concepts = await this.cognitiveConceptRepository.findByModelId(userId, modelId);
        const relations = await this.cognitiveRelationRepository.findByModelId(userId, modelId);
        const blindspots = [];
        blindspots.push(...this.detectIsolatedConcepts(concepts, relations, options));
        blindspots.push(...this.detectLowDensityAreas(concepts, relations, options));
        blindspots.push(...this.detectModelGaps(concepts, relations, options));
        blindspots.push(...this.detectThemeCoverageGaps(concepts, options));
        const blindspotDistribution = this.calculateBlindspotDistribution(blindspots);
        const summary = this.generateAnalysisSummary(blindspots);
        const recommendations = this.generateRecommendations(blindspots);
        const result = {
            id: (0, uuid_1.v4)(),
            blindspots,
            blindspotDistribution,
            summary,
            recommendations,
            createdAt: new Date()
        };
        return result;
    }
    async getBlindspotById(userId, blindspotId) {
        return null;
    }
    async getBlindspotsByModelId(userId, modelId, options) {
        const result = await this.detectBlindspots(userId, modelId);
        let filteredBlindspots = result.blindspots;
        if (options?.blindspotTypes && options.blindspotTypes.length > 0) {
            filteredBlindspots = filteredBlindspots.filter(blindspot => options.blindspotTypes.includes(blindspot.type));
        }
        if (options?.impactThreshold !== undefined) {
            filteredBlindspots = filteredBlindspots.filter(blindspot => blindspot.impact >= options.impactThreshold);
        }
        if (options?.offset !== undefined) {
            filteredBlindspots = filteredBlindspots.slice(options.offset);
        }
        if (options?.limit !== undefined) {
            filteredBlindspots = filteredBlindspots.slice(0, options.limit);
        }
        return filteredBlindspots;
    }
    async updateBlindspot(userId, blindspotId, updateData) {
        throw new Error('Not implemented');
    }
    async deleteBlindspot(userId, blindspotId) {
        return true;
    }
    detectIsolatedConcepts(concepts, relations, options) {
        const blindspots = [];
        const conceptIdsWithRelations = new Set();
        relations.forEach(relation => {
            conceptIdsWithRelations.add(relation.sourceConceptId);
            conceptIdsWithRelations.add(relation.targetConceptId);
        });
        const isolatedConcepts = concepts.filter(concept => !conceptIdsWithRelations.has(concept.id));
        isolatedConcepts.forEach(concept => {
            blindspots.push({
                id: (0, uuid_1.v4)(),
                description: `概念 "${concept.name}" 是一个孤立概念，没有与其他概念建立任何关系。`,
                type: 'ISOLATED_CONCEPT',
                impact: 0.7,
                relatedThemes: concept.tags || [],
                potentialRisks: [
                    '孤立概念可能表示对该概念的理解不够深入',
                    '孤立概念无法为认知模型的整体结构做出贡献',
                    '孤立概念可能是模型中的冗余信息'
                ]
            });
        });
        return blindspots;
    }
    detectLowDensityAreas(concepts, relations, options) {
        const blindspots = [];
        const modelDensity = this.calculateModelDensity(concepts.length, relations.length);
        if (modelDensity < 0.3) {
            blindspots.push({
                id: (0, uuid_1.v4)(),
                description: `认知模型的整体概念密度较低（密度：${modelDensity.toFixed(2)}），概念之间的连接不够紧密。`,
                type: 'LOW_DENSITY_AREA',
                impact: 0.8,
                relatedThemes: [],
                potentialRisks: [
                    '低密度模型可能表示认知结构不够完整',
                    '概念之间缺乏足够的关联，可能影响整体理解',
                    '模型可能存在多个孤立的概念集群'
                ]
            });
        }
        return blindspots;
    }
    detectModelGaps(concepts, relations, options) {
        const blindspots = [];
        const allTags = new Set();
        concepts.forEach(concept => {
            if (concept.tags && Array.isArray(concept.tags)) {
                concept.tags.forEach((tag) => {
                    allTags.add(tag);
                });
            }
        });
        if (allTags.size < 3 && concepts.length > 10) {
            blindspots.push({
                id: (0, uuid_1.v4)(),
                description: `认知模型的主题标签数量较少（仅 ${allTags.size} 个），可能存在主题覆盖不足的问题。`,
                type: 'THEME_GAP',
                impact: 0.6,
                relatedThemes: Array.from(allTags),
                potentialRisks: [
                    '主题覆盖不足可能导致认知模型不够全面',
                    '可能忽略了重要的相关主题',
                    '模型可能缺乏多样性和深度'
                ]
            });
        }
        return blindspots;
    }
    detectThemeCoverageGaps(concepts, options) {
        const blindspots = [];
        const themeConceptCount = {};
        concepts.forEach(concept => {
            if (concept.tags && Array.isArray(concept.tags)) {
                concept.tags.forEach((tag) => {
                    themeConceptCount[tag] = (themeConceptCount[tag] || 0) + 1;
                });
            }
        });
        Object.entries(themeConceptCount).forEach(([theme, count]) => {
            if (count < 2) {
                blindspots.push({
                    id: (0, uuid_1.v4)(),
                    description: `主题 "${theme}" 只有 ${count} 个相关概念，覆盖不足。`,
                    type: 'THEME_COVERAGE_GAP',
                    impact: 0.5,
                    relatedThemes: [theme],
                    potentialRisks: [
                        `对主题 "${theme}" 的理解可能不够深入`,
                        `主题 "${theme}" 可能无法为认知模型提供足够的价值`,
                        `建议进一步探索与主题 "${theme}" 相关的概念`
                    ]
                });
            }
        });
        return blindspots;
    }
    calculateModelDensity(conceptCount, relationCount) {
        if (conceptCount <= 1)
            return 0;
        const maxPossibleRelations = conceptCount * (conceptCount - 1);
        return relationCount / maxPossibleRelations;
    }
    calculateBlindspotDistribution(blindspots) {
        const distribution = {};
        blindspots.forEach(blindspot => {
            distribution[blindspot.type] = (distribution[blindspot.type] || 0) + 1;
        });
        return distribution;
    }
    generateAnalysisSummary(blindspots) {
        if (blindspots.length === 0) {
            return '未检测到明显的认知盲点，您的认知模型结构较为完整。';
        }
        const typeCounts = {};
        blindspots.forEach(blindspot => {
            typeCounts[blindspot.type] = (typeCounts[blindspot.type] || 0) + 1;
        });
        const typeSummary = Object.entries(typeCounts)
            .map(([type, count]) => `${type}: ${count}个`)
            .join(', ');
        return `共检测到 ${blindspots.length} 个认知盲点，分布情况：${typeSummary}。这些盲点可能表示您的认知模型中存在结构不完整、连接不紧密或覆盖不足的区域。`;
    }
    generateRecommendations(blindspots) {
        const recommendations = [];
        const hasIsolatedConcepts = blindspots.some(blindspot => blindspot.type === 'ISOLATED_CONCEPT');
        const hasLowDensityAreas = blindspots.some(blindspot => blindspot.type === 'LOW_DENSITY_AREA');
        const hasThemeGaps = blindspots.some(blindspot => blindspot.type === 'THEME_GAP' || blindspot.type === 'THEME_COVERAGE_GAP');
        if (hasIsolatedConcepts) {
            recommendations.push('为孤立概念添加相关关系，将其整合到认知模型的整体结构中。');
        }
        if (hasLowDensityAreas) {
            recommendations.push('加强概念之间的连接，提高认知模型的整体密度。');
            recommendations.push('探索不同概念之间的潜在关联，建立更多有意义的关系。');
        }
        if (hasThemeGaps) {
            recommendations.push('进一步探索主题覆盖不足的领域，添加更多相关概念。');
            recommendations.push('考虑引入新的主题来丰富认知模型的覆盖范围。');
        }
        recommendations.push('定期审查认知模型，识别并修复新出现的盲点。');
        recommendations.push('通过添加新的思想片段和概念来持续丰富认知模型。');
        return recommendations;
    }
}
exports.BlindspotDetectionServiceImpl = BlindspotDetectionServiceImpl;
//# sourceMappingURL=blindspot-detection-service-impl.js.map