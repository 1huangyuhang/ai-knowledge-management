"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeAnalysisServiceImpl = void 0;
const uuid_1 = require("uuid");
class ThemeAnalysisServiceImpl {
    cognitiveConceptRepository;
    cognitiveRelationRepository;
    cognitiveModelRepository;
    dataAnalysisService;
    constructor(cognitiveConceptRepository, cognitiveRelationRepository, cognitiveModelRepository, dataAnalysisService) {
        this.cognitiveConceptRepository = cognitiveConceptRepository;
        this.cognitiveRelationRepository = cognitiveRelationRepository;
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.dataAnalysisService = dataAnalysisService;
    }
    async analyzeThemes(userId, modelId, options) {
        const concepts = await this.cognitiveConceptRepository.findByModelId(userId, modelId);
        const relations = await this.cognitiveRelationRepository.findByModelId(userId, modelId);
        const themes = this.generateThemesFromConcepts(concepts, options);
        const themeDistribution = this.calculateThemeDistribution(themes);
        const dominantTheme = this.determineDominantTheme(themes);
        const summary = this.generateAnalysisSummary(themes, dominantTheme);
        const recommendations = this.generateRecommendations(themes, dominantTheme);
        const result = {
            id: (0, uuid_1.v4)(),
            themes,
            themeDistribution,
            dominantTheme,
            summary,
            recommendations,
            createdAt: new Date()
        };
        return result;
    }
    async getThemeById(userId, themeId) {
        return {
            id: themeId,
            name: '示例主题',
            description: '这是一个示例主题描述',
            strength: 0.8,
            relatedConcepts: [],
            type: '示例类型'
        };
    }
    async getThemesByModelId(userId, modelId) {
        const result = await this.analyzeThemes(userId, modelId);
        return result.themes;
    }
    async analyzeConceptThemes(userId, modelId, conceptId) {
        const concept = await this.cognitiveConceptRepository.findById(userId, conceptId);
        if (!concept) {
            throw new Error(`Concept ${conceptId} not found for user ${userId}`);
        }
        const themes = await this.getThemesByModelId(userId, modelId);
        return themes.slice(0, 2);
    }
    async analyzeRelationThemes(userId, modelId, relationId) {
        const relation = await this.cognitiveRelationRepository.findById(userId, relationId);
        if (!relation) {
            throw new Error(`Relation ${relationId} not found for user ${userId}`);
        }
        const themes = await this.getThemesByModelId(userId, modelId);
        return themes.slice(0, 2);
    }
    generateThemesFromConcepts(concepts, options) {
        const maxThemes = options?.maxThemes || 5;
        const themeStrengthThreshold = options?.themeStrengthThreshold || 0.5;
        const tagFrequency = {};
        concepts.forEach(concept => {
            if (concept.tags && Array.isArray(concept.tags)) {
                concept.tags.forEach((tag) => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            }
        });
        const themes = Object.entries(tagFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxThemes)
            .map(([tag, frequency]) => {
            const strength = Math.min(1, frequency / concepts.length * 2);
            if (strength < themeStrengthThreshold) {
                return null;
            }
            const relatedConcepts = concepts
                .filter(concept => concept.tags && concept.tags.includes(tag))
                .map(concept => concept.id);
            return {
                id: (0, uuid_1.v4)(),
                name: tag,
                description: `与 ${tag} 相关的概念集合`,
                strength,
                relatedConcepts,
                type: '自动生成'
            };
        })
            .filter((theme) => theme !== null);
        if (themes.length < 2) {
            const defaultThemes = [
                {
                    id: (0, uuid_1.v4)(),
                    name: '核心概念',
                    description: '认知模型中的核心概念集合',
                    strength: 0.8,
                    relatedConcepts: concepts
                        .sort((a, b) => b.importance - a.importance)
                        .slice(0, 5)
                        .map(concept => concept.id),
                    type: '默认主题'
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: '重要关系',
                    description: '认知模型中的重要关系集合',
                    strength: 0.7,
                    relatedConcepts: concepts
                        .sort((a, b) => b.importance - a.importance)
                        .slice(0, 3)
                        .map(concept => concept.id),
                    type: '默认主题'
                }
            ];
            themes.push(...defaultThemes);
        }
        return themes;
    }
    calculateThemeDistribution(themes) {
        const distribution = {};
        themes.forEach(theme => {
            distribution[theme.name] = theme.strength;
        });
        return distribution;
    }
    determineDominantTheme(themes) {
        return themes.sort((a, b) => b.strength - a.strength)[0];
    }
    generateAnalysisSummary(themes, dominantTheme) {
        return `共识别出 ${themes.length} 个主题，其中主导主题为 "${dominantTheme.name}"，强度为 ${dominantTheme.strength.toFixed(2)}。该主题包含 ${dominantTheme.relatedConcepts.length} 个相关概念，是认知模型中的核心主题。`;
    }
    generateRecommendations(themes, dominantTheme) {
        const recommendations = [];
        if (themes.length < 3) {
            recommendations.push('认知模型的主题数量较少，建议进一步丰富模型内容，增加更多相关概念和关系');
        }
        else if (themes.length > 7) {
            recommendations.push('认知模型的主题数量较多，建议对主题进行分类和整合，提高模型的结构化程度');
        }
        recommendations.push(`主导主题 "${dominantTheme.name}" 包含 ${dominantTheme.relatedConcepts.length} 个相关概念，建议进一步深化该主题的内容，增加更多细节和关联`);
        const weakThemes = themes.filter(theme => theme.strength < 0.6);
        if (weakThemes.length > 0) {
            recommendations.push(`存在 ${weakThemes.length} 个强度较低的主题，建议加强这些主题的内容或考虑合并到其他主题中`);
        }
        return recommendations;
    }
}
exports.ThemeAnalysisServiceImpl = ThemeAnalysisServiceImpl;
//# sourceMappingURL=theme-analysis-service-impl.js.map