"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackFormattingKeys = void 0;
exports.initializeFeedbackFormattingDependencies = initializeFeedbackFormattingDependencies;
const container_1 = require("./container");
const feedback_formatting_service_impl_1 = require("../application/ai/cognitive-feedback/feedback-formatting-service-impl");
async function initializeFeedbackFormattingDependencies() {
    container_1.container.register('FeedbackFormattingService', () => new feedback_formatting_service_impl_1.FeedbackFormattingServiceImpl(), true);
    console.log('Feedback formatting dependencies initialized and registered in DI container');
}
exports.FeedbackFormattingKeys = {
    FeedbackFormattingService: 'FeedbackFormattingService'
};
//# sourceMappingURL=feedback-formatting.config.js.map