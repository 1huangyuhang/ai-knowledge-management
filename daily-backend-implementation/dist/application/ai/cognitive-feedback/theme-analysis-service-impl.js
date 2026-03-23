"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeAnalysisServiceImpl = void 0;
const uuid_1 = require("uuid");
class ThemeAnalysisServiceImpl {
    cognitiveModelRepository;
    constructor(cognitiveModelRepository) {
        this.cognitiveModelRepository = cognitiveModelRepository;
    }
    async analyzeThemes(param1, param2, param3) {
        let concepts = [];
        let relations = [];
        if (Array.isArray(param1) && Array.isArray(param2)) {
            concepts = param1;
            relations = param2;
        }
        else {
            const userId = param1;
            const modelId = param2;
            const options = param3;
            const model = await this.cognitiveModelRepository.findById(modelId, userId);
            if (!model) {
                throw new Error(`认知模型 ${modelId} 不存在`);
            }
            concepts = [];
            relations = [];
        }
        let themes = [];
        const conceptThemes = this.generateThemesFromConcepts(concepts, param3);
        themes = [...themes, ...conceptThemes];
        const relationThemes = this.generateThemesFromRelations(relations, concepts, param3);
        themes = [...themes, ...relationThemes];
        themes = this.mergeSimilarThemes(themes);
        themes = this.filterThemes(themes, param3);
        themes.sort((a, b) => b.strength - a.strength);
        if (param3?.maxThemes) {
            themes = themes.slice(0, param3.maxThemes);
        }
        const themeDistribution = this.getThemeDistribution(themes);
        const dominantTheme = this.identifyDominantTheme(themes);
        const summary = this.generateAnalysisSummary(themes, dominantTheme);
        const recommendations = this.generateRecommendations(themes, dominantTheme);
        return {
            id: (0, uuid_1.v4)(),
            themes,
            themeDistribution,
            dominantTheme,
            summary,
            recommendations,
            createdAt: new Date()
        };
    }
    generateThemesFromConcepts(concepts, options) {
        const themes = [];
        if (concepts.length === 0) {
            return themes;
        }
        const conceptsByType = new Map();
        concepts.forEach(concept => {
            const type = concept.type || 'general';
            if (!conceptsByType.has(type)) {
                conceptsByType.set(type, []);
            }
            conceptsByType.get(type).push(concept);
        });
        conceptsByType.forEach((typeConcepts, type) => {
            const keywords = this.extractKeywords(typeConcepts);
            const theme = {
                id: (0, uuid_1.v4)(),
                name: this.generateThemeName(type, keywords),
                description: this.generateThemeDescription(type, typeConcepts),
                strength: this.calculateThemeStrength(typeConcepts),
                relatedConcepts: typeConcepts.map(concept => concept.id),
                type,
                keywords
            };
            themes.push(theme);
        });
        return themes;
    }
    generateThemesFromRelations(relations, concepts, options) {
        const themes = [];
        if (relations.length === 0) {
            return themes;
        }
        const relationsByType = new Map();
        relations.forEach(relation => {
            const type = relation.type || 'related';
            if (!relationsByType.has(type)) {
                relationsByType.set(type, []);
            }
            relationsByType.get(type).push(relation);
        });
        relationsByType.forEach((typeRelations, type) => {
            const relatedConceptIds = new Set();
            typeRelations.forEach(relation => {
                relatedConceptIds.add(relation.sourceId);
                relatedConceptIds.add(relation.targetId);
            });
            const relatedConcepts = concepts.filter(concept => relatedConceptIds.has(concept.id));
            const keywords = this.extractKeywords(relatedConcepts);
            const theme = {
                id: (0, uuid_1.v4)(),
                name: this.generateRelationThemeName(type, keywords),
                description: this.generateRelationThemeDescription(type, typeRelations, relatedConcepts),
                strength: this.calculateRelationThemeStrength(typeRelations, relatedConcepts),
                relatedConcepts: Array.from(relatedConceptIds),
                type: `relation_${type}`,
                keywords
            };
            themes.push(theme);
        });
        return themes;
    }
    getThemeDistribution(themes) {
        const distribution = {};
        const totalStrength = themes.reduce((sum, theme) => sum + theme.strength, 0);
        if (totalStrength === 0) {
            return distribution;
        }
        themes.forEach(theme => {
            distribution[theme.name] = parseFloat((theme.strength / totalStrength).toFixed(2));
        });
        return distribution;
    }
    identifyDominantTheme(themes) {
        if (themes.length === 0) {
            return null;
        }
        const sortedThemes = [...themes].sort((a, b) => b.strength - a.strength);
        return sortedThemes[0];
    }
    mergeSimilarThemes(themes) {
        const mergedThemes = [];
        const processedIndexes = new Set();
        for (let i = 0; i < themes.length; i++) {
            if (processedIndexes.has(i))
                continue;
            const currentTheme = themes[i];
            const similarThemes = [currentTheme];
            processedIndexes.add(i);
            for (let j = i + 1; j < themes.length; j++) {
                if (processedIndexes.has(j))
                    continue;
                const otherTheme = themes[j];
                if (this.areThemesSimilar(currentTheme, otherTheme)) {
                    similarThemes.push(otherTheme);
                    processedIndexes.add(j);
                }
            }
            if (similarThemes.length === 1) {
                mergedThemes.push(currentTheme);
                continue;
            }
            const mergedTheme = this.mergeThemes(similarThemes);
            mergedThemes.push(mergedTheme);
        }
        return mergedThemes;
    }
    areThemesSimilar(theme1, theme2) {
        const commonKeywords = theme1.keywords.filter(keyword => theme2.keywords.includes(keyword));
        const overlapRatio = commonKeywords.length / Math.max(theme1.keywords.length, theme2.keywords.length);
        return overlapRatio >= 0.5;
    }
    mergeThemes(themes) {
        const mergedKeywords = new Set();
        themes.forEach(theme => {
            theme.keywords.forEach(keyword => mergedKeywords.add(keyword));
        });
        const mergedRelatedConcepts = new Set();
        themes.forEach(theme => {
            theme.relatedConcepts.forEach(conceptId => mergedRelatedConcepts.add(conceptId));
        });
        const totalStrength = themes.reduce((sum, theme) => sum + theme.strength, 0);
        const averageStrength = totalStrength / themes.length;
        const primaryTheme = themes.reduce((max, theme) => theme.strength > max.strength ? theme : max, themes[0]);
        const mergedName = primaryTheme.name;
        const mergedDescription = this.generateMergedThemeDescription(themes);
        return {
            id: (0, uuid_1.v4)(),
            name: mergedName,
            description: mergedDescription,
            strength: averageStrength,
            relatedConcepts: Array.from(mergedRelatedConcepts),
            type: primaryTheme.type,
            keywords: Array.from(mergedKeywords)
        };
    }
    filterThemes(themes, options) {
        let filteredThemes = [...themes];
        if (options?.themeStrengthThreshold !== undefined) {
            filteredThemes = filteredThemes.filter(theme => theme.strength >= options.themeStrengthThreshold);
        }
        return filteredThemes;
    }
    extractKeywords(concepts) {
        const keywords = new Set();
        concepts.forEach(concept => {
            if (concept.name) {
                keywords.add(concept.name.toLowerCase());
            }
            if (concept.tags && Array.isArray(concept.tags)) {
                concept.tags.forEach((tag) => keywords.add(tag.toLowerCase()));
            }
            if (concept.attributes) {
                Object.values(concept.attributes).forEach(value => {
                    if (typeof value === 'string') {
                        value.split(' ').forEach(word => {
                            if (word.length > 3) {
                                keywords.add(word.toLowerCase());
                            }
                        });
                    }
                });
            }
        });
        const commonWords = new Set(['the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by']);
        return Array.from(keywords).filter(keyword => !commonWords.has(keyword));
    }
    generateThemeName(type, keywords) {
        const topKeywords = keywords.slice(0, 3).join('、');
        return `${type.charAt(0).toUpperCase() + type.slice(1)} 主题 (${topKeywords})`;
    }
    generateThemeDescription(type, concepts) {
        return `这是一个关于${type}的主题，包含 ${concepts.length} 个相关概念，主要涉及 ${this.extractKeywords(concepts).slice(0, 5).join('、')} 等关键词。`;
    }
    generateRelationThemeName(type, keywords) {
        const topKeywords = keywords.slice(0, 3).join('、');
        return `${type.charAt(0).toUpperCase() + type.slice(1)} 关系主题 (${topKeywords})`;
    }
    generateRelationThemeDescription(type, relations, concepts) {
        return `这是一个关于${type}关系的主题，包含 ${relations.length} 个相关关系，涉及 ${concepts.length} 个概念，主要涉及 ${this.extractKeywords(concepts).slice(0, 5).join('、')} 等关键词。`;
    }
    generateMergedThemeDescription(themes) {
        const totalConcepts = new Set();
        themes.forEach(theme => {
            theme.relatedConcepts.forEach(conceptId => totalConcepts.add(conceptId));
        });
        const uniqueKeywords = new Set();
        themes.forEach(theme => {
            theme.keywords.forEach(keyword => uniqueKeywords.add(keyword));
        });
        return `这是一个合并主题，包含 ${totalConcepts.size} 个相关概念，${themes.length} 个子主题，主要涉及 ${Array.from(uniqueKeywords).slice(0, 5).join('、')} 等关键词。`;
    }
    calculateThemeStrength(concepts) {
        let strength = concepts.length;
        concepts.forEach(concept => {
            if (concept.attributes) {
                strength += Object.keys(concept.attributes).length * 0.5;
            }
            if (concept.tags && Array.isArray(concept.tags)) {
                strength += concept.tags.length * 0.3;
            }
        });
        return strength;
    }
    calculateRelationThemeStrength(relations, concepts) {
        let strength = relations.length;
        strength += concepts.length * 0.5;
        return strength;
    }
    generateAnalysisSummary(themes, dominantTheme) {
        if (themes.length === 0) {
            return '当前认知模型中没有足够的概念和关系来生成主题分析。';
        }
        let summary = `在当前认知模型中识别出 ${themes.length} 个主题。`;
        if (dominantTheme) {
            summary += ` 主导主题是 "${dominantTheme.name}"，涉及 ${dominantTheme.relatedConcepts.length} 个概念。`;
        }
        summary += ' 这些主题涵盖了多个领域和概念类型，反映了认知模型的主要关注点。';
        return summary;
    }
    generateRecommendations(themes, dominantTheme) {
        const recommendations = [];
        if (themes.length === 0) {
            recommendations.push('建议添加更多概念和关系，以便进行更有效的主题分析。');
            return recommendations;
        }
        if (themes.length < 3) {
            recommendations.push('当前主题数量较少，建议扩展认知模型，添加更多相关概念和关系。');
        }
        if (dominantTheme) {
            const dominantConceptCount = dominantTheme.relatedConcepts.length;
            const totalConcepts = new Set();
            themes.forEach(theme => {
                theme.relatedConcepts.forEach(conceptId => totalConcepts.add(conceptId));
            });
            if (dominantConceptCount > totalConcepts.size * 0.6) {
                recommendations.push(`主导主题 "${dominantTheme.name}" 占比较大，建议平衡认知模型，添加更多其他领域的概念和关系。`);
            }
        }
        const themeTypes = new Set(themes.map(theme => theme.type));
        if (themeTypes.size < themes.length * 0.5) {
            recommendations.push('主题类型相对单一，建议添加更多类型的概念和关系，以丰富认知模型。');
        }
        recommendations.push('定期审查和更新主题分析，以跟踪认知模型的演化和变化。');
        return recommendations;
    }
}
exports.ThemeAnalysisServiceImpl = ThemeAnalysisServiceImpl;
//# sourceMappingURL=theme-analysis-service-impl.js.map