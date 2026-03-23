"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackFormattingServiceImpl = void 0;
const cognitive_feedback_1 = require("../../../domain/ai/cognitive-feedback/cognitive-feedback");
const cognitive_feedback_2 = require("../../../domain/ai/cognitive-feedback/cognitive-feedback");
const uuid_1 = require("uuid");
class FeedbackFormattingServiceImpl {
    constructor() { }
    async formatFeedback(data, format) {
        return {
            text: '# 认知反馈\n\n## 洞察\n' + data.insights.length + '条洞察\n\n## 主题\n' + data.themes.length + '个主题\n\n## 盲点\n' + data.blindspots.length + '个盲点\n\n## 差距\n' + data.gaps.length + '个差距',
            structured: {
                insights: data.insights,
                themes: data.themes,
                blindspots: data.blindspots,
                gaps: data.gaps
            },
            visual: {
                type: 'dashboard',
                data: {
                    insights: data.insights.length,
                    themes: data.themes.length,
                    blindspots: data.blindspots.length,
                    gaps: data.gaps.length
                }
            },
            interactive: {
                type: 'interactive_dashboard',
                sections: ['insights', 'themes', 'blindspots', 'gaps']
            }
        };
    }
    async formatInsightsAsFeedback(userId, modelId, insights, options) {
        let content;
        switch (options.format) {
            case cognitive_feedback_1.FeedbackFormat.STRUCTURED:
                content = this.formatInsightsAsStructured(insights, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.VISUAL:
                content = this.formatInsightsAsVisual(insights, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.INTERACTIVE:
                content = this.formatInsightsAsInteractive(insights, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.TEXT:
            default:
                content = this.formatInsightsAsText(insights, options);
                break;
        }
        const feedback = {
            id: (0, uuid_1.v4)(),
            title: '认知洞察反馈',
            type: 'INSIGHT_FEEDBACK',
            content,
            format: options.format,
            relatedInsightIds: insights.map(insight => insight.id),
            createdAt: new Date()
        };
        return feedback;
    }
    async formatThemeAnalysisAsFeedback(userId, modelId, themeAnalysisResult, options) {
        let content;
        switch (options.format) {
            case cognitive_feedback_1.FeedbackFormat.STRUCTURED:
                content = this.formatThemeAnalysisAsStructured(themeAnalysisResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.VISUAL:
                content = this.formatThemeAnalysisAsVisual(themeAnalysisResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.INTERACTIVE:
                content = this.formatThemeAnalysisAsInteractive(themeAnalysisResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.TEXT:
            default:
                content = this.formatThemeAnalysisAsText(themeAnalysisResult, options);
                break;
        }
        const feedback = {
            id: (0, uuid_1.v4)(),
            title: '主题分析反馈',
            type: 'THEME_FEEDBACK',
            content,
            format: options.format,
            relatedInsightIds: [],
            createdAt: new Date()
        };
        return feedback;
    }
    async formatBlindspotDetectionAsFeedback(userId, modelId, blindspotDetectionResult, options) {
        let content;
        switch (options.format) {
            case cognitive_feedback_1.FeedbackFormat.STRUCTURED:
                content = this.formatBlindspotDetectionAsStructured(blindspotDetectionResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.VISUAL:
                content = this.formatBlindspotDetectionAsVisual(blindspotDetectionResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.INTERACTIVE:
                content = this.formatBlindspotDetectionAsInteractive(blindspotDetectionResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.TEXT:
            default:
                content = this.formatBlindspotDetectionAsText(blindspotDetectionResult, options);
                break;
        }
        const feedback = {
            id: (0, uuid_1.v4)(),
            title: '盲点检测反馈',
            type: 'BLINDSPOT_FEEDBACK',
            content,
            format: options.format,
            relatedInsightIds: [],
            createdAt: new Date()
        };
        return feedback;
    }
    async formatGapIdentificationAsFeedback(userId, modelId, gapIdentificationResult, options) {
        let content;
        switch (options.format) {
            case cognitive_feedback_1.FeedbackFormat.STRUCTURED:
                content = this.formatGapIdentificationAsStructured(gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.VISUAL:
                content = this.formatGapIdentificationAsVisual(gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.INTERACTIVE:
                content = this.formatGapIdentificationAsInteractive(gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.TEXT:
            default:
                content = this.formatGapIdentificationAsText(gapIdentificationResult, options);
                break;
        }
        const feedback = {
            id: (0, uuid_1.v4)(),
            title: '差距识别反馈',
            type: 'GAP_FEEDBACK',
            content,
            format: options.format,
            relatedInsightIds: [],
            createdAt: new Date()
        };
        return feedback;
    }
    async formatComprehensiveFeedback(userId, modelId, insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options) {
        let content;
        switch (options.format) {
            case cognitive_feedback_1.FeedbackFormat.STRUCTURED:
                content = this.formatComprehensiveAsStructured(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.VISUAL:
                content = this.formatComprehensiveAsVisual(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.INTERACTIVE:
                content = this.formatComprehensiveAsInteractive(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options);
                break;
            case cognitive_feedback_1.FeedbackFormat.TEXT:
            default:
                content = this.formatComprehensiveAsText(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options);
                break;
        }
        const feedback = {
            id: (0, uuid_1.v4)(),
            title: '综合认知反馈',
            type: 'COMPREHENSIVE_FEEDBACK',
            content,
            format: options.format,
            relatedInsightIds: insights.map(insight => insight.id),
            createdAt: new Date()
        };
        return feedback;
    }
    async convertFeedbackFormat(feedback, format) {
        if (feedback.format === format) {
            return feedback;
        }
        return {
            ...feedback,
            format,
            id: (0, uuid_1.v4)()
        };
    }
    formatInsightsAsText(insights, options) {
        if (insights.length === 0) {
            return '未生成任何认知洞察';
        }
        let text = '# 认知洞察反馈\n\n';
        text += `## 概述\n共生成 ${insights.length} 条认知洞察\n\n`;
        const insightsByType = this.groupInsightsByType(insights);
        Object.entries(insightsByType).forEach(([type, typeInsights]) => {
            text += `## ${this.getInsightTypeLabel(type)}\n\n`;
            typeInsights.forEach(insight => {
                text += `### ${insight.title}\n`;
                text += `${insight.description}\n`;
                text += `**重要性**: ${insight.importance.toFixed(1)} / 10\n`;
                text += `**置信度**: ${insight.confidence.toFixed(1)} / 10\n`;
                if (insight.suggestions && insight.suggestions.length > 0) {
                    text += '**建议**:\n';
                    insight.suggestions.forEach(suggestion => {
                        text += `- ${suggestion}\n`;
                    });
                }
                text += '\n';
            });
        });
        return text;
    }
    formatInsightsAsStructured(insights, options) {
        const structuredData = {
            summary: {
                totalInsights: insights.length,
                insightTypes: this.getUniqueInsightTypes(insights)
            },
            insights: insights.map(insight => ({
                id: insight.id,
                type: insight.type,
                title: insight.title,
                description: insight.description,
                importance: insight.importance,
                confidence: insight.confidence,
                relatedConceptIds: insight.relatedConceptIds || [],
                relatedRelationIds: insight.relatedRelationIds || [],
                suggestions: insight.suggestions || [],
                createdAt: insight.createdAt.toISOString()
            }))
        };
        return JSON.stringify(structuredData, null, 2);
    }
    formatInsightsAsVisual(insights, options) {
        const visualConfig = {
            type: 'insight_visualization',
            title: '认知洞察可视化',
            data: {
                insights: insights.map(insight => ({
                    id: insight.id,
                    type: insight.type,
                    title: insight.title,
                    importance: insight.importance,
                    confidence: insight.confidence,
                    relatedConcepts: insight.relatedConceptIds || []
                }))
            },
            visualization: {
                chartType: 'bubble',
                xAxis: 'importance',
                yAxis: 'confidence',
                size: 'relatedConceptIds.length',
                color: 'type'
            }
        };
        return JSON.stringify(visualConfig, null, 2);
    }
    formatInsightsAsInteractive(insights, options) {
        const interactiveConfig = {
            type: 'interactive_insight',
            title: '交互式认知洞察',
            insights: insights.map(insight => ({
                id: insight.id,
                type: insight.type,
                title: insight.title,
                description: insight.description,
                importance: insight.importance,
                confidence: insight.confidence,
                suggestions: insight.suggestions || [],
                actions: [
                    { type: 'explore_concepts', conceptIds: insight.relatedConceptIds || [] },
                    { type: 'explore_relations', relationIds: insight.relatedRelationIds || [] },
                    { type: 'generate_followup' }
                ]
            }))
        };
        return JSON.stringify(interactiveConfig, null, 2);
    }
    formatThemeAnalysisAsText(themeAnalysisResult, options) {
        let text = '# 主题分析反馈\n\n';
        text += `## 概述\n`;
        text += `${themeAnalysisResult.summary}\n\n`;
        text += `## 主导主题\n`;
        text += `${themeAnalysisResult.dominantTheme.name}: ${themeAnalysisResult.dominantTheme.description}\n`;
        text += `**强度**: ${themeAnalysisResult.dominantTheme.strength.toFixed(1)} / 10\n\n`;
        text += `## 所有主题\n\n`;
        themeAnalysisResult.themes.forEach(theme => {
            text += `### ${theme.name}\n`;
            text += `${theme.description}\n`;
            text += `**强度**: ${theme.strength.toFixed(1)} / 10\n`;
            if (theme.relatedConcepts.length > 0) {
                text += `**相关概念**: ${theme.relatedConcepts.join(', ')}\n`;
            }
            text += `**类型**: ${theme.type}\n\n`;
        });
        if (themeAnalysisResult.recommendations.length > 0) {
            text += `## 建议\n\n`;
            themeAnalysisResult.recommendations.forEach(recommendation => {
                text += `- ${recommendation}\n`;
            });
        }
        return text;
    }
    formatThemeAnalysisAsStructured(themeAnalysisResult, options) {
        return JSON.stringify({
            id: themeAnalysisResult.id,
            themes: themeAnalysisResult.themes,
            themeDistribution: themeAnalysisResult.themeDistribution,
            dominantTheme: themeAnalysisResult.dominantTheme,
            summary: themeAnalysisResult.summary,
            recommendations: themeAnalysisResult.recommendations,
            createdAt: themeAnalysisResult.createdAt.toISOString()
        }, null, 2);
    }
    formatThemeAnalysisAsVisual(themeAnalysisResult, options) {
        const visualConfig = {
            type: 'theme_visualization',
            title: '主题分析可视化',
            data: {
                themes: themeAnalysisResult.themes.map(theme => ({
                    id: theme.id,
                    name: theme.name,
                    strength: theme.strength,
                    relatedConcepts: theme.relatedConcepts.length
                })),
                dominantTheme: themeAnalysisResult.dominantTheme.id
            },
            visualization: {
                chartType: 'radar',
                dimensions: themeAnalysisResult.themes.map(theme => theme.name),
                values: themeAnalysisResult.themes.map(theme => theme.strength)
            }
        };
        return JSON.stringify(visualConfig, null, 2);
    }
    formatThemeAnalysisAsInteractive(themeAnalysisResult, options) {
        const interactiveConfig = {
            type: 'interactive_theme_analysis',
            title: '交互式主题分析',
            data: {
                themes: themeAnalysisResult.themes,
                dominantTheme: themeAnalysisResult.dominantTheme
            },
            actions: [
                { type: 'explore_theme', themeId: themeAnalysisResult.dominantTheme.id },
                { type: 'compare_themes' },
                { type: 'generate_theme_insights' }
            ]
        };
        return JSON.stringify(interactiveConfig, null, 2);
    }
    formatBlindspotDetectionAsText(blindspotDetectionResult, options) {
        let text = '# 盲点检测反馈\n\n';
        text += `## 概述\n${blindspotDetectionResult.summary}\n\n`;
        if (blindspotDetectionResult.blindspots.length > 0) {
            text += `## 检测到的盲点\n\n`;
            blindspotDetectionResult.blindspots.forEach(blindspot => {
                text += `### ${blindspot.description}\n`;
                text += `**类型**: ${blindspot.type}\n`;
                text += `**影响程度**: ${blindspot.impact.toFixed(1)} / 10\n`;
                if (blindspot.relatedThemes.length > 0) {
                    text += `**相关主题**: ${blindspot.relatedThemes.join(', ')}\n`;
                }
                if (blindspot.potentialRisks.length > 0) {
                    text += `**潜在风险**:\n`;
                    blindspot.potentialRisks.forEach(risk => {
                        text += `- ${risk}\n`;
                    });
                }
                text += '\n';
            });
        }
        if (blindspotDetectionResult.recommendations.length > 0) {
            text += `## 建议\n\n`;
            blindspotDetectionResult.recommendations.forEach(recommendation => {
                text += `- ${recommendation}\n`;
            });
        }
        return text;
    }
    formatBlindspotDetectionAsStructured(blindspotDetectionResult, options) {
        return JSON.stringify({
            id: blindspotDetectionResult.id,
            blindspots: blindspotDetectionResult.blindspots,
            blindspotDistribution: blindspotDetectionResult.blindspotDistribution,
            summary: blindspotDetectionResult.summary,
            recommendations: blindspotDetectionResult.recommendations,
            createdAt: blindspotDetectionResult.createdAt.toISOString()
        }, null, 2);
    }
    formatBlindspotDetectionAsVisual(blindspotDetectionResult, options) {
        const visualConfig = {
            type: 'blindspot_visualization',
            title: '盲点检测可视化',
            data: {
                blindspots: blindspotDetectionResult.blindspots.map(blindspot => ({
                    id: blindspot.id,
                    description: blindspot.description,
                    type: blindspot.type,
                    impact: blindspot.impact,
                    potentialRisks: blindspot.potentialRisks.length
                }))
            },
            visualization: {
                chartType: 'heatmap',
                xAxis: 'type',
                yAxis: 'impact',
                value: 'potentialRisks'
            }
        };
        return JSON.stringify(visualConfig, null, 2);
    }
    formatBlindspotDetectionAsInteractive(blindspotDetectionResult, options) {
        const interactiveConfig = {
            type: 'interactive_blindspot_detection',
            title: '交互式盲点检测',
            data: {
                blindspots: blindspotDetectionResult.blindspots,
                distribution: blindspotDetectionResult.blindspotDistribution
            },
            actions: [
                { type: 'explore_blindspot_impact' },
                { type: 'generate_blindspot_recommendations' },
                { type: 'track_blindspot_progress' }
            ]
        };
        return JSON.stringify(interactiveConfig, null, 2);
    }
    formatGapIdentificationAsText(gapIdentificationResult, options) {
        let text = '# 差距识别反馈\n\n';
        text += `## 概述\n${gapIdentificationResult.summary}\n\n`;
        if (gapIdentificationResult.gaps.length > 0) {
            text += `## 识别到的差距\n\n`;
            gapIdentificationResult.gaps.forEach(gap => {
                text += `### ${gap.description}\n`;
                text += `**类型**: ${gap.type}\n`;
                text += `**差距大小**: ${gap.size.toFixed(1)} / 10\n`;
                if (gap.relatedConcepts.length > 0) {
                    text += `**相关概念**: ${gap.relatedConcepts.join(', ')}\n`;
                }
                if (gap.relatedRelations.length > 0) {
                    text += `**相关关系**: ${gap.relatedRelations.join(', ')}\n`;
                }
                text += `**改进方向**: ${gap.improvementDirection}\n\n`;
            });
        }
        if (gapIdentificationResult.recommendations.length > 0) {
            text += `## 建议\n\n`;
            gapIdentificationResult.recommendations.forEach(recommendation => {
                text += `- ${recommendation}\n`;
            });
        }
        return text;
    }
    formatGapIdentificationAsStructured(gapIdentificationResult, options) {
        return JSON.stringify({
            id: gapIdentificationResult.id,
            gaps: gapIdentificationResult.gaps,
            gapDistribution: gapIdentificationResult.gapDistribution,
            summary: gapIdentificationResult.summary,
            recommendations: gapIdentificationResult.recommendations,
            createdAt: gapIdentificationResult.createdAt.toISOString()
        }, null, 2);
    }
    formatGapIdentificationAsVisual(gapIdentificationResult, options) {
        const visualConfig = {
            type: 'gap_visualization',
            title: '差距识别可视化',
            data: {
                gaps: gapIdentificationResult.gaps.map(gap => ({
                    id: gap.id,
                    description: gap.description,
                    type: gap.type,
                    size: gap.size
                }))
            },
            visualization: {
                chartType: 'bar',
                xAxis: 'description',
                yAxis: 'size',
                color: 'type'
            }
        };
        return JSON.stringify(visualConfig, null, 2);
    }
    formatGapIdentificationAsInteractive(gapIdentificationResult, options) {
        const interactiveConfig = {
            type: 'interactive_gap_identification',
            title: '交互式差距识别',
            data: {
                gaps: gapIdentificationResult.gaps,
                distribution: gapIdentificationResult.gapDistribution
            },
            actions: [
                { type: 'prioritize_gaps' },
                { type: 'generate_gap_improvement_plan' },
                { type: 'compare_gap_progress' }
            ]
        };
        return JSON.stringify(interactiveConfig, null, 2);
    }
    formatComprehensiveAsText(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options) {
        let text = '# 综合认知反馈\n\n';
        text += `生成时间: ${new Date().toLocaleString()}\n\n`;
        text += `## 认知洞察摘要\n`;
        text += `共生成 ${insights.length} 条认知洞察\n\n`;
        text += `## 主题分析摘要\n`;
        text += `${themeAnalysisResult.summary}\n`;
        text += `主导主题: ${themeAnalysisResult.dominantTheme.name}\n\n`;
        text += `## 盲点检测摘要\n`;
        text += `${blindspotDetectionResult.summary}\n\n`;
        text += `## 差距识别摘要\n`;
        text += `${gapIdentificationResult.summary}\n\n`;
        text += `## 综合建议\n`;
        const allRecommendations = [
            ...themeAnalysisResult.recommendations,
            ...blindspotDetectionResult.recommendations,
            ...gapIdentificationResult.recommendations
        ];
        const uniqueRecommendations = Array.from(new Set(allRecommendations));
        uniqueRecommendations.forEach((recommendation, index) => {
            text += `${index + 1}. ${recommendation}\n`;
        });
        return text;
    }
    formatComprehensiveAsStructured(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options) {
        return JSON.stringify({
            summary: {
                totalInsights: insights.length,
                totalThemes: themeAnalysisResult.themes.length,
                totalBlindspots: blindspotDetectionResult.blindspots.length,
                totalGaps: gapIdentificationResult.gaps.length
            },
            insights: insights.map(insight => ({
                id: insight.id,
                type: insight.type,
                title: insight.title,
                importance: insight.importance,
                confidence: insight.confidence
            })),
            themeAnalysis: {
                dominantTheme: themeAnalysisResult.dominantTheme,
                summary: themeAnalysisResult.summary
            },
            blindspotDetection: {
                summary: blindspotDetectionResult.summary,
                blindspotDistribution: blindspotDetectionResult.blindspotDistribution
            },
            gapIdentification: {
                summary: gapIdentificationResult.summary,
                gapDistribution: gapIdentificationResult.gapDistribution
            },
            recommendations: Array.from(new Set([
                ...themeAnalysisResult.recommendations,
                ...blindspotDetectionResult.recommendations,
                ...gapIdentificationResult.recommendations
            ])),
            createdAt: new Date().toISOString()
        }, null, 2);
    }
    formatComprehensiveAsVisual(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options) {
        const visualConfig = {
            type: 'comprehensive_visualization',
            title: '综合认知反馈可视化',
            data: {
                insights: insights.length,
                themes: themeAnalysisResult.themes.length,
                blindspots: blindspotDetectionResult.blindspots.length,
                gaps: gapIdentificationResult.gaps.length
            },
            visualization: {
                chartType: 'dashboard',
                widgets: [
                    {
                        type: 'metric',
                        title: '认知洞察数量',
                        value: insights.length
                    },
                    {
                        type: 'metric',
                        title: '主题数量',
                        value: themeAnalysisResult.themes.length
                    },
                    {
                        type: 'metric',
                        title: '盲点数量',
                        value: blindspotDetectionResult.blindspots.length
                    },
                    {
                        type: 'metric',
                        title: '差距数量',
                        value: gapIdentificationResult.gaps.length
                    }
                ]
            }
        };
        return JSON.stringify(visualConfig, null, 2);
    }
    formatComprehensiveAsInteractive(insights, themeAnalysisResult, blindspotDetectionResult, gapIdentificationResult, options) {
        const interactiveConfig = {
            type: 'interactive_comprehensive_feedback',
            title: '交互式综合认知反馈',
            data: {
                summary: {
                    insights: insights.length,
                    themes: themeAnalysisResult.themes.length,
                    blindspots: blindspotDetectionResult.blindspots.length,
                    gaps: gapIdentificationResult.gaps.length
                }
            },
            sections: [
                { id: 'insights', title: '认知洞察' },
                { id: 'themes', title: '主题分析' },
                { id: 'blindspots', title: '盲点检测' },
                { id: 'gaps', title: '差距识别' }
            ],
            actions: [
                { type: 'generate_action_plan' },
                { type: 'export_feedback' },
                { type: 'schedule_followup' }
            ]
        };
        return JSON.stringify(interactiveConfig, null, 2);
    }
    groupInsightsByType(insights) {
        return insights.reduce((groups, insight) => {
            const type = insight.type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(insight);
            return groups;
        }, {});
    }
    getInsightTypeLabel(type) {
        const labels = {
            [cognitive_feedback_2.CognitiveInsightType.CONCEPT_INSIGHT]: '概念洞察',
            [cognitive_feedback_2.CognitiveInsightType.RELATION_INSIGHT]: '关系洞察',
            [cognitive_feedback_2.CognitiveInsightType.STRUCTURE_INSIGHT]: '结构洞察',
            [cognitive_feedback_2.CognitiveInsightType.EVOLUTION_INSIGHT]: '演化洞察',
            [cognitive_feedback_2.CognitiveInsightType.THEME_INSIGHT]: '主题洞察',
            [cognitive_feedback_2.CognitiveInsightType.BLINDSPOT_INSIGHT]: '盲点洞察',
            [cognitive_feedback_2.CognitiveInsightType.GAP_INSIGHT]: '差距洞察'
        };
        return labels[type] || type;
    }
    getUniqueInsightTypes(insights) {
        const types = new Set();
        insights.forEach(insight => types.add(insight.type));
        return Array.from(types);
    }
}
exports.FeedbackFormattingServiceImpl = FeedbackFormattingServiceImpl;
//# sourceMappingURL=feedback-formatting-service-impl.js.map