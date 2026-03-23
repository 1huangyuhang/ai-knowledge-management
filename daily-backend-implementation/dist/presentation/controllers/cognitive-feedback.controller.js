"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveFeedbackController = void 0;
const container_1 = require("../../di/container");
class CognitiveFeedbackController {
    insightGenerationService;
    themeAnalysisService;
    blindspotDetectionService;
    gapIdentificationService;
    feedbackFormattingService;
    constructor() {
        this.insightGenerationService = container_1.container.resolve('InsightGenerationService');
        this.themeAnalysisService = container_1.container.resolve('ThemeAnalysisService');
        this.blindspotDetectionService = container_1.container.resolve('BlindspotDetectionService');
        this.gapIdentificationService = container_1.container.resolve('GapIdentificationService');
        this.feedbackFormattingService = container_1.container.resolve('FeedbackFormattingService');
    }
    async generateInsights(request, reply) {
        try {
            const { options } = request.body;
            const modelId = request.params?.modelId;
            const userId = 'anonymous';
            const insights = await this.insightGenerationService.generateInsights(userId, modelId, options);
            return reply.send({ success: true, data: insights });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to generate insights' });
        }
    }
    async analyzeThemes(request, reply) {
        try {
            const { options } = request.body;
            const modelId = request.params?.modelId;
            const userId = 'anonymous';
            const themes = await this.themeAnalysisService.analyzeThemes(userId, modelId, options);
            return reply.send({ success: true, data: themes });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to analyze themes' });
        }
    }
    async detectBlindspots(request, reply) {
        try {
            const { options } = request.body;
            const modelId = request.params?.modelId;
            const userId = 'anonymous';
            const blindspots = await this.blindspotDetectionService.detectBlindspots(userId, modelId, options);
            return reply.send({ success: true, data: blindspots });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to detect blindspots' });
        }
    }
    async identifyGaps(request, reply) {
        try {
            const { options } = request.body;
            const modelId = request.params?.modelId;
            const userId = 'anonymous';
            const gaps = await this.gapIdentificationService.identifyGaps(userId, modelId, options);
            return reply.send({ success: true, data: gaps });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to identify gaps' });
        }
    }
    async generateFeedback(request, reply) {
        try {
            const { options } = request.body;
            const modelId = request.params?.modelId;
            const userId = 'anonymous';
            const insights = await this.insightGenerationService.generateInsights(userId, modelId, options);
            const themes = await this.themeAnalysisService.analyzeThemes(userId, modelId, options);
            const blindspots = await this.blindspotDetectionService.detectBlindspots(userId, modelId, options);
            const gaps = await this.gapIdentificationService.identifyGaps(userId, modelId, options);
            return reply.send({
                success: true,
                data: {
                    insights,
                    themes,
                    blindspots,
                    gaps
                }
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to generate feedback' });
        }
    }
}
exports.CognitiveFeedbackController = CognitiveFeedbackController;
//# sourceMappingURL=cognitive-feedback.controller.js.map