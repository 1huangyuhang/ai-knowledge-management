"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionAnalysisServiceImpl = void 0;
const uuid_1 = require("uuid");
const evolution_analysis_types_1 = require("../interfaces/evolution-analysis.types");
class EvolutionAnalysisServiceImpl {
    evolutionHistoryService;
    versionManagementService;
    evolutionPatternService;
    dataAnalysisService;
    constructor(evolutionHistoryService, versionManagementService, evolutionPatternService, dataAnalysisService) {
        this.evolutionHistoryService = evolutionHistoryService;
        this.versionManagementService = versionManagementService;
        this.evolutionPatternService = evolutionPatternService;
        this.dataAnalysisService = dataAnalysisService;
    }
    async analyzeEvolutionTrends(userId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const startDate = options?.startDate || new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            timeRange: { start: startDate, end: endTime }
        });
        const versions = await this.versionManagementService.getVersions(userId, {
            createdAtRange: { start: startDate, end: endTime }
        });
        const metrics = await this.dataAnalysisService.calculateTrendMetrics(evolutionEvents);
        const keyEvents = await this.dataAnalysisService.identifyKeyEvents(evolutionEvents);
        const predictions = await this.dataAnalysisService.predictFutureTrends(metrics);
        const recommendations = await this.dataAnalysisService.generateRecommendations(metrics, predictions);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.TREND_ANALYSIS,
            analyzedAt: new Date(),
            timeRange: { start: startDate, end: endTime },
            data: {
                metrics,
                keyEvents,
                predictions
            },
            summary: this.generateTrendSummary(metrics, keyEvents, predictions),
            recommendations
        };
        return result;
    }
    async analyzeConceptEvolution(userId, conceptId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const startDate = options?.startDate || new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            timeRange: { start: startDate, end: endTime }
        });
        const conceptEvents = evolutionEvents.filter(event => {
            return event.relatedEntities?.includes(conceptId) ||
                event.affectedConcepts?.includes(conceptId);
        });
        const metrics = await this.dataAnalysisService.calculateTrendMetrics(conceptEvents);
        const keyEvents = await this.dataAnalysisService.identifyKeyEvents(conceptEvents);
        const predictions = await this.dataAnalysisService.predictFutureTrends(metrics);
        const recommendations = await this.dataAnalysisService.generateRecommendations(metrics, predictions);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.CONCEPT_EVOLUTION,
            analyzedAt: new Date(),
            timeRange: { start: startDate, end: endTime },
            data: {
                conceptId,
                metrics,
                keyEvents,
                predictions
            },
            summary: this.generateConceptEvolutionSummary(conceptId, metrics, keyEvents, predictions),
            recommendations
        };
        return result;
    }
    async analyzeRelationEvolution(userId, relationId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const startDate = options?.startDate || new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            timeRange: { start: startDate, end: endTime }
        });
        const relationEvents = evolutionEvents.filter(event => {
            return event.affectedRelations?.includes(relationId);
        });
        const metrics = await this.dataAnalysisService.calculateTrendMetrics(relationEvents);
        const keyEvents = await this.dataAnalysisService.identifyKeyEvents(relationEvents);
        const predictions = await this.dataAnalysisService.predictFutureTrends(metrics);
        const recommendations = await this.dataAnalysisService.generateRecommendations(metrics, predictions);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.RELATION_EVOLUTION,
            analyzedAt: new Date(),
            timeRange: { start: startDate, end: endTime },
            data: {
                relationId,
                metrics,
                keyEvents,
                predictions
            },
            summary: this.generateRelationEvolutionSummary(relationId, metrics, keyEvents, predictions),
            recommendations
        };
        return result;
    }
    async identifyEvolutionPatterns(userId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const startDate = options?.startDate || new Date(endTime.getTime() - 60 * 24 * 60 * 60 * 1000);
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            timeRange: { start: startDate, end: endTime }
        });
        const conceptPatterns = await this.evolutionPatternService.recognizeConceptPatterns(evolutionEvents);
        const relationPatterns = await this.evolutionPatternService.recognizeRelationPatterns(evolutionEvents);
        const overallPatterns = await this.evolutionPatternService.recognizeOverallPatterns(evolutionEvents);
        const allPatterns = [...conceptPatterns, ...relationPatterns, ...overallPatterns];
        const patternDistribution = await this.dataAnalysisService.calculatePatternDistribution(allPatterns);
        const dominantPattern = await this.dataAnalysisService.determineDominantPattern(allPatterns);
        const recommendations = this.generatePatternRecommendations(allPatterns, dominantPattern);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.PATTERN_RECOGNITION,
            analyzedAt: new Date(),
            timeRange: { start: startDate, end: endTime },
            data: {
                patterns: allPatterns,
                patternDistribution,
                dominantPattern
            },
            summary: this.generatePatternRecognitionSummary(allPatterns, dominantPattern),
            recommendations
        };
        return result;
    }
    async evaluateEvolutionImpact(userId, versionId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            versionId: versionId
        });
        const impactMetrics = await this.dataAnalysisService.calculateImpactMetrics(evolutionEvents);
        const impactDetails = await this.dataAnalysisService.analyzeImpactDetails(evolutionEvents);
        let impactLevel = 'low';
        if (impactMetrics.impactDegree > 0.7) {
            impactLevel = 'high';
        }
        else if (impactMetrics.impactDegree > 0.3) {
            impactLevel = 'medium';
        }
        const recommendations = this.generateImpactRecommendations(impactMetrics, impactDetails, impactLevel);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.IMPACT_EVALUATION,
            analyzedAt: new Date(),
            timeRange: { start: evolutionEvents[0]?.timestamp || endTime, end: endTime },
            data: {
                impactMetrics,
                impactDetails,
                impactLevel
            },
            summary: this.generateImpactEvaluationSummary(impactMetrics, impactDetails, impactLevel),
            recommendations
        };
        return result;
    }
    async predictModelEvolution(userId, options) {
        const startTime = Date.now();
        const endTime = new Date();
        const startDate = options?.startDate || new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        const evolutionEvents = await this.evolutionHistoryService.getEvolutionHistory(userId, {
            timeRange: { start: startDate, end: endTime }
        });
        const trendMetrics = await this.dataAnalysisService.calculateTrendMetrics(evolutionEvents);
        const predictions = await this.dataAnalysisService.predictFutureTrends(trendMetrics, options);
        const riskAssessment = this.generateRiskAssessment(predictions);
        const recommendations = await this.dataAnalysisService.generateRecommendations(trendMetrics, predictions);
        const result = {
            id: (0, uuid_1.v4)(),
            userId,
            type: evolution_analysis_types_1.EvolutionAnalysisType.EVOLUTION_PREDICTION,
            analyzedAt: new Date(),
            timeRange: { start: startDate, end: endTime },
            data: {
                predictionMetrics: trendMetrics,
                predictionConfidence: predictions.predictionConfidence || 0.7,
                predictedTrends: predictions,
                riskAssessment
            },
            summary: this.generatePredictionSummary(predictions, riskAssessment),
            recommendations
        };
        return result;
    }
    async generateAnalysisReport(userId, analysisResults) {
        const reportTitle = `认知模型演化分析报告 - ${new Date().toISOString().split('T')[0]}`;
        const allRecommendations = analysisResults.flatMap(result => result.recommendations);
        const uniqueRecommendations = [...new Set(allRecommendations)];
        const summary = this.generateReportSummary(analysisResults);
        const report = {
            id: (0, uuid_1.v4)(),
            userId,
            generatedAt: new Date(),
            title: reportTitle,
            summary,
            analysisResults,
            recommendations: uniqueRecommendations,
            status: 'completed',
            format: 'json'
        };
        return report;
    }
    generateTrendSummary(metrics, keyEvents, predictions) {
        return `识别了 ${keyEvents.length} 个关键演化事件，概念数量呈现 ${this.getTrendDirection(metrics.conceptCountTrend.values)} 趋势，关系数量呈现 ${this.getTrendDirection(metrics.relationCountTrend.values)} 趋势。预测未来30天内，模型一致性得分将 ${predictions.consistencyScore > metrics.consistencyScoreTrend.values[metrics.consistencyScoreTrend.values.length - 1] ? '上升' : '下降'}。`;
    }
    generateConceptEvolutionSummary(conceptId, metrics, keyEvents, predictions) {
        return `概念 ${conceptId} 在分析周期内经历了 ${keyEvents.length} 个关键演化事件，呈现 ${this.getTrendDirection(metrics.conceptCountTrend.values)} 趋势。预测未来30天内，该概念的重要性将 ${predictions.conceptCount > metrics.conceptCountTrend.values[metrics.conceptCountTrend.values.length - 1] ? '上升' : '下降'}。`;
    }
    generateRelationEvolutionSummary(relationId, metrics, keyEvents, predictions) {
        return `关系 ${relationId} 在分析周期内经历了 ${keyEvents.length} 个关键演化事件，呈现 ${this.getTrendDirection(metrics.relationCountTrend.values)} 趋势。预测未来30天内，该关系的数量将 ${predictions.relationCount > metrics.relationCountTrend.values[metrics.relationCountTrend.values.length - 1] ? '增加' : '减少'}。`;
    }
    generatePatternRecognitionSummary(patterns, dominantPattern) {
        return `识别了 ${patterns.length} 种演化模式，其中主导模式为 ${dominantPattern?.name || '无'}，占比 ${((dominantPattern?.confidence || 0) * 100).toFixed(1)}%。`;
    }
    generateImpactEvaluationSummary(impactMetrics, impactDetails, impactLevel) {
        return `版本更新影响范围涵盖 ${impactDetails.affectedConcepts.length} 个概念和 ${impactDetails.affectedRelations.length} 个关系，影响程度为 ${impactLevel}，影响持续时间约为 ${impactMetrics.impactDuration.toFixed(1)} 天。`;
    }
    generatePredictionSummary(predictions, riskAssessment) {
        return `预测未来30天内，概念数量将增长至 ${Math.round(predictions.conceptCount)}，关系数量将增长至 ${Math.round(predictions.relationCount)}，模型一致性得分将 ${predictions.consistencyScore > 0.7 ? '保持良好' : '需要关注'}。识别到 ${riskAssessment.risks.length} 个潜在风险。`;
    }
    generateReportSummary(analysisResults) {
        return `该报告包含 ${analysisResults.length} 项分析结果，涵盖趋势分析、模式识别、影响评估等多个方面，为认知模型的演化提供了全面的分析和建议。`;
    }
    generatePatternRecommendations(patterns, dominantPattern) {
        const recommendations = [];
        if (dominantPattern?.type === 'DECLINING_EVOLUTION') {
            recommendations.push('模型演化呈现衰退趋势，建议加强模型维护和更新频率。');
        }
        else if (dominantPattern?.type === 'RESTRUCTURING_EVOLUTION') {
            recommendations.push('模型正在经历重构演化，建议重点关注模型一致性和完整性。');
        }
        else if (dominantPattern?.type === 'EXPONENTIAL_GROWTH') {
            recommendations.push('模型呈现指数增长趋势，建议优化模型结构以支持持续增长。');
        }
        if (patterns.length > 5) {
            recommendations.push('识别到多种演化模式，建议进一步分析每种模式的影响和原因。');
        }
        if (recommendations.length === 0) {
            recommendations.push('模型演化模式正常，建议继续观察。');
        }
        return recommendations;
    }
    generateImpactRecommendations(impactMetrics, impactDetails, impactLevel) {
        const recommendations = [];
        if (impactLevel === 'high') {
            recommendations.push('影响程度较高，建议进行全面的回归测试。');
        }
        if (impactDetails.affectedConcepts.length > 10) {
            recommendations.push('影响概念数量较多，建议重点验证核心概念的完整性。');
        }
        if (impactDetails.affectedRelations.length > 20) {
            recommendations.push('影响关系数量较多，建议检查关系类型和权重设置。');
        }
        if (recommendations.length === 0) {
            recommendations.push('影响评估结果正常，建议继续观察。');
        }
        return recommendations;
    }
    generateRiskAssessment(predictions) {
        const risks = [];
        const riskLevels = {};
        if (predictions.consistencyScore < 0.5) {
            risks.push('模型一致性得分较低，可能影响模型质量。');
            riskLevels['consistency'] = 'high';
        }
        if (predictions.evolutionSpeed > 2.0) {
            risks.push('演化速度较快，可能导致模型不稳定。');
            riskLevels['evolutionSpeed'] = 'medium';
        }
        if (risks.length === 0) {
            risks.push('未识别到明显风险。');
            riskLevels['general'] = 'low';
        }
        return {
            risks,
            riskLevels
        };
    }
    getTrendDirection(values) {
        if (values.length < 2) {
            return '稳定';
        }
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = lastValue - firstValue;
        const percentageChange = (change / firstValue) * 100;
        if (percentageChange > 20) {
            return '快速增长';
        }
        else if (percentageChange > 5) {
            return '增长';
        }
        else if (percentageChange < -20) {
            return '快速下降';
        }
        else if (percentageChange < -5) {
            return '下降';
        }
        else {
            return '稳定';
        }
    }
}
exports.EvolutionAnalysisServiceImpl = EvolutionAnalysisServiceImpl;
//# sourceMappingURL=evolution-analysis-service-impl.js.map