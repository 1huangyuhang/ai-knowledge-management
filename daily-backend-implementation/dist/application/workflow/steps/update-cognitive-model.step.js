"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCognitiveModelStep = void 0;
class UpdateCognitiveModelStep {
    updateCognitiveModelUseCase;
    constructor(updateCognitiveModelUseCase) {
        this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
    }
    async execute(_, context) {
        const proposalId = context.get('proposalId');
        if (!proposalId) {
            throw new Error('Proposal ID not found in context');
        }
        const model = await this.updateCognitiveModelUseCase.execute(proposalId);
        context.set('modelId', model.id);
        return model;
    }
    getName() {
        return 'UpdateCognitiveModelStep';
    }
}
exports.UpdateCognitiveModelStep = UpdateCognitiveModelStep;
//# sourceMappingURL=update-cognitive-model.step.js.map