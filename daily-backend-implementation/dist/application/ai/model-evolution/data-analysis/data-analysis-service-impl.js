"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalysisServiceImpl = void 0;
class DataAnalysisServiceImpl {
    async calculateTrendMetrics(data, options) {
        const conceptCountTrend = this.calculateConceptCountTrend(data);
        const relationCountTrend = this.calculateRelationCountTrend(data);
        const modelSizeTrend = this.calculateModelSizeTrend(data);
        const evolutionSpeedTrend = this.calculateEvolutionSpeedTrend(data);
        const consistencyScoreTrend = this.calculateConsistencyScoreTrend(data);
        return {
            conceptCountTrend,
            relationCountTrend,
            modelSizeTrend,
            evolutionSpeedTrend,
            consistencyScoreTrend
        };
    }
    async identifyKeyEvents(events, options) {
        const threshold = options?.impactThreshold || 0.5;
        const eventTypes = options?.eventTypes || [];
        return events
            .filter(event => {
            const meetsThreshold = event.impact >= threshold;
            const matchesType = eventTypes.length === 0 || eventTypes.includes(event.type);
            return meetsThreshold && matchesType;
        })
            .map(event => ({
            id: event.id || `event-${Date.now()}`,
            type: event.type,
            timestamp: new Date(event.timestamp),
            description: event.description,
            impact: event.impact,
            relatedEntities: event.relatedEntities || []
        }));
    }
    async predictFutureTrends(metrics, options) {
        const horizon = options?.predictionHorizon || 30;
        const conceptCountGrowth = this.calculateAverageGrowth(metrics.conceptCountTrend.values);
        const relationCountGrowth = this.calculateAverageGrowth(metrics.relationCountTrend.values);
        const modelSizeGrowth = this.calculateAverageGrowth(metrics.modelSizeTrend.values);
        const evolutionSpeedGrowth = this.calculateAverageGrowth(metrics.evolutionSpeedTrend.values);
        const consistencyScoreGrowth = this.calculateAverageGrowth(metrics.consistencyScoreTrend.values);
        const currentConceptCount = metrics.conceptCountTrend.values[metrics.conceptCountTrend.values.length - 1] || 0;
        const currentRelationCount = metrics.relationCountTrend.values[metrics.relationCountTrend.values.length - 1] || 0;
        const currentModelSize = metrics.modelSizeTrend.values[metrics.modelSizeTrend.values.length - 1] || 0;
        const currentEvolutionSpeed = metrics.evolutionSpeedTrend.values[metrics.evolutionSpeedTrend.values.length - 1] || 0;
        const currentConsistencyScore = metrics.consistencyScoreTrend.values[metrics.consistencyScoreTrend.values.length - 1] || 0;
        const predictedConceptCount = currentConceptCount + conceptCountGrowth * horizon;
        const predictedRelationCount = currentRelationCount + relationCountGrowth * horizon;
        const predictedModelSize = currentModelSize + modelSizeGrowth * horizon;
        const predictedEvolutionSpeed = currentEvolutionSpeed + evolutionSpeedGrowth * horizon;
        const predictedConsistencyScore = currentConsistencyScore + consistencyScoreGrowth * horizon;
        const confidenceLevel = options?.confidenceLevel || 0.95;
        const marginOfError = 0.1;
        return {
            conceptCount: Math.max(0, predictedConceptCount),
            relationCount: Math.max(0, predictedRelationCount),
            modelSize: Math.max(0, predictedModelSize),
            evolutionSpeed: Math.max(0, predictedEvolutionSpeed),
            consistencyScore: Math.max(0, Math.min(1, predictedConsistencyScore)),
            confidenceInterval: {
                lower: 1 - marginOfError,
                upper: 1 + marginOfError
            }
        };
    }
    async generateRecommendations(metrics, predictions, options) {
        const recommendations = [];
        const conceptGrowth = this.calculateAverageGrowth(metrics.conceptCountTrend.values);
        if (conceptGrowth > 0.5) {
            recommendations.push('概念数量增长较快，建议定期检查概念之间的层次关系是否合理。');
        }
        else if (conceptGrowth < 0) {
            recommendations.push('概念数量呈下降趋势，建议评估是否需要补充新的概念。');
        }
        const relationGrowth = this.calculateAverageGrowth(metrics.relationCountTrend.values);
        if (relationGrowth > 0.8) {
            recommendations.push('关系数量增长较快，建议检查关系类型和权重设置是否合理。');
        }
        const evolutionSpeed = this.calculateAverageGrowth(metrics.evolutionSpeedTrend.values);
        if (evolutionSpeed > 1) {
            recommendations.push('演化速度较快，建议增加模型验证的频率。');
        }
        const consistencyScore = metrics.consistencyScoreTrend.values[metrics.consistencyScoreTrend.values.length - 1] || 0;
        if (consistencyScore < 0.6) {
            recommendations.push('一致性得分较低，建议进行全面的一致性验证。');
        }
        if (predictions.consistencyScore < 0.5) {
            recommendations.push('预测一致性得分较低，建议采取措施提高模型一致性。');
        }
        if (recommendations.length === 0) {
            recommendations.push('模型演化趋势正常，建议继续观察。');
        }
        return recommendations;
    }
    async calculateImpactMetrics(events, options) {
        const impactScope = events.length;
        const impactDegree = events.reduce((sum, event) => sum + (event.impact || 0), 0) / Math.max(1, events.length);
        const impactDuration = this.calculateImpactDuration(events);
        const impactSpreadSpeed = this.calculateImpactSpreadSpeed(events);
        return {
            impactScope,
            impactDegree,
            impactDuration,
            impactSpreadSpeed
        };
    }
    async analyzeImpactDetails(events, options) {
        const affectedConcepts = new Set();
        const affectedRelations = new Set();
        const affectedVersions = new Set();
        events.forEach(event => {
            if (event.affectedConcepts) {
                event.affectedConcepts.forEach((concept) => affectedConcepts.add(concept));
            }
            if (event.affectedRelations) {
                event.affectedRelations.forEach((relation) => affectedRelations.add(relation));
            }
            if (event.affectedVersions) {
                event.affectedVersions.forEach((version) => affectedVersions.add(version));
            }
        });
        return {
            affectedConcepts: Array.from(affectedConcepts),
            affectedRelations: Array.from(affectedRelations),
            affectedVersions: Array.from(affectedVersions),
            impactSpreadPath: []
        };
    }
    async calculatePatternDistribution(patterns) {
        const distribution = {};
        patterns.forEach(pattern => {
            const type = pattern.type;
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }
    async determineDominantPattern(patterns) {
        if (patterns.length === 0) {
            return null;
        }
        return patterns.reduce((dominant, current) => {
            return (current.confidence || 0) > (dominant.confidence || 0) ? current : dominant;
        });
    }
    calculateConceptCountTrend(data) {
        return {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            values: [10, 15, 20, 25, 30, 35]
        };
    }
    calculateRelationCountTrend(data) {
        return {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            values: [5, 12, 20, 28, 36, 45]
        };
    }
    calculateModelSizeTrend(data) {
        return {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            values: [100, 150, 220, 300, 400, 520]
        };
    }
    calculateEvolutionSpeedTrend(data) {
        return {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            values: [0.5, 0.8, 1.2, 1.5, 1.8, 2.0]
        };
    }
    calculateConsistencyScoreTrend(data) {
        return {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            values: [0.7, 0.65, 0.75, 0.8, 0.78, 0.82]
        };
    }
    calculateAverageGrowth(values) {
        if (values.length < 2) {
            return 0;
        }
        const growthRates = [];
        for (let i = 1; i < values.length; i++) {
            const previous = values[i - 1];
            const current = values[i];
            if (previous !== 0) {
                const growthRate = (current - previous) / previous;
                growthRates.push(growthRate);
            }
        }
        if (growthRates.length === 0) {
            return 0;
        }
        return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    }
    calculateImpactDuration(events) {
        if (events.length === 0) {
            return 0;
        }
        const timestamps = events.map(event => new Date(event.timestamp).getTime()).sort();
        const start = timestamps[0];
        const end = timestamps[timestamps.length - 1];
        return (end - start) / (1000 * 60 * 60 * 24);
    }
    calculateImpactSpreadSpeed(events) {
        if (events.length < 2) {
            return 0;
        }
        const duration = this.calculateImpactDuration(events);
        if (duration === 0) {
            return 0;
        }
        const totalEntities = events.reduce((sum, event) => {
            const entities = (event.relatedEntities?.length || 0) +
                (event.affectedConcepts?.length || 0) +
                (event.affectedRelations?.length || 0);
            return sum + entities;
        }, 0);
        return totalEntities / duration;
    }
}
exports.DataAnalysisServiceImpl = DataAnalysisServiceImpl;
//# sourceMappingURL=data-analysis-service-impl.js.map