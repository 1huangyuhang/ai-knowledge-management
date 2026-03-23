"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFactorConfidenceScoringService = void 0;
class MultiFactorConfidenceScoringService {
    similarityService;
    llmClient;
    constructor(similarityService, llmClient) {
        this.similarityService = similarityService;
        this.llmClient = llmClient;
    }
    async scoreConfidence(request) {
        const { entity, context, relatedEntities = [] } = request;
        const originalScore = entity.getConfidenceScore();
        const metrics = await this.calculateMetrics(entity, context, relatedEntities);
        const { adjustedScore, adjustmentReason } = this.adjustScore(originalScore, metrics);
        return {
            originalScore,
            adjustedScore,
            adjustmentReason,
            metrics
        };
    }
    async batchScoreConfidence(requests) {
        return Promise.all(requests.map(request => this.scoreConfidence(request)));
    }
    isConfidenceThresholdMet(score, threshold = 0.5) {
        return score >= threshold;
    }
    async calculateMetrics(entity, context, relatedEntities = []) {
        const metrics = {
            semanticConsistency: 0.5,
            structuralConsistency: 0.5,
            sourceReliability: 0.7,
            contextRelevance: 0.6
        };
        return metrics;
    }
    adjustScore(originalScore, metrics) {
        const weights = {
            semanticConsistency: 0.3,
            structuralConsistency: 0.3,
            sourceReliability: 0.2,
            contextRelevance: 0.2
        };
        const weightedAverage = metrics.semanticConsistency * weights.semanticConsistency +
            metrics.structuralConsistency * weights.structuralConsistency +
            metrics.sourceReliability * weights.sourceReliability +
            metrics.contextRelevance * weights.contextRelevance;
        const adjustedScore = Math.max(0, Math.min(1, originalScore * 0.6 + weightedAverage * 0.4));
        let adjustmentReason = `Adjusted from original score ${originalScore.toFixed(2)} based on: `;
        adjustmentReason += `semantic consistency (${metrics.semanticConsistency.toFixed(2)}, weight ${weights.semanticConsistency}), `;
        adjustmentReason += `structural consistency (${metrics.structuralConsistency.toFixed(2)}, weight ${weights.structuralConsistency}), `;
        adjustmentReason += `source reliability (${metrics.sourceReliability.toFixed(2)}, weight ${weights.sourceReliability}), `;
        adjustmentReason += `context relevance (${metrics.contextRelevance.toFixed(2)}, weight ${weights.contextRelevance})`;
        return { adjustedScore, adjustmentReason };
    }
}
exports.MultiFactorConfidenceScoringService = MultiFactorConfidenceScoringService;
//# sourceMappingURL=ConfidenceScoringService.js.map