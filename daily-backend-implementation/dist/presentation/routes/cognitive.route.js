"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCognitiveRoutes = configureCognitiveRoutes;
const cognitive_feedback_controller_1 = require("../controllers/cognitive-feedback.controller");
async function configureCognitiveRoutes(instance) {
    const cognitiveFeedbackController = new cognitive_feedback_controller_1.CognitiveFeedbackController();
    instance.register((cognitiveInstance, _, done) => {
        cognitiveInstance.get('/health', async (_, reply) => {
            return reply.send({
                status: 'ok',
                service: 'cognitive-service'
            });
        });
        cognitiveInstance.post('/:modelId/insights', cognitiveFeedbackController.generateInsights.bind(cognitiveFeedbackController));
        cognitiveInstance.post('/:modelId/themes', cognitiveFeedbackController.analyzeThemes.bind(cognitiveFeedbackController));
        cognitiveInstance.post('/:modelId/blindspots', cognitiveFeedbackController.detectBlindspots.bind(cognitiveFeedbackController));
        cognitiveInstance.post('/:modelId/gaps', cognitiveFeedbackController.identifyGaps.bind(cognitiveFeedbackController));
        cognitiveInstance.post('/:modelId/feedback', cognitiveFeedbackController.generateFeedback.bind(cognitiveFeedbackController));
        done();
    }, { prefix: '/cognitive' });
}
//# sourceMappingURL=cognitive.route.js.map