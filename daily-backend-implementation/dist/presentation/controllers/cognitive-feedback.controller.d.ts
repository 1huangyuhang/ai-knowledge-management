import { FastifyRequest, FastifyReply } from 'fastify';
export declare class CognitiveFeedbackController {
    private insightGenerationService;
    private themeAnalysisService;
    private blindspotDetectionService;
    private gapIdentificationService;
    private feedbackFormattingService;
    constructor();
    generateInsights(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    analyzeThemes(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    detectBlindspots(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    identifyGaps(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    generateFeedback(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
//# sourceMappingURL=cognitive-feedback.controller.d.ts.map