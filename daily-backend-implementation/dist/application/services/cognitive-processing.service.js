"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveProcessingService = void 0;
class CognitiveProcessingService {
    workflowFactory;
    constructor(workflowFactory) {
        this.workflowFactory = workflowFactory;
    }
    async processThought(input) {
        const workflow = this.workflowFactory.createCognitiveProcessingWorkflow();
        return await workflow.execute(input);
    }
}
exports.CognitiveProcessingService = CognitiveProcessingService;
//# sourceMappingURL=cognitive-processing.service.js.map