"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateProposalStep = void 0;
class GenerateProposalStep {
    generateProposalUseCase;
    constructor(generateProposalUseCase) {
        this.generateProposalUseCase = generateProposalUseCase;
    }
    async execute(_, context) {
        const thoughtId = context.get('thoughtId');
        if (!thoughtId) {
            throw new Error('Thought ID not found in context');
        }
        const proposal = await this.generateProposalUseCase.execute(thoughtId);
        context.set('proposalId', proposal.id);
        return proposal;
    }
    getName() {
        return 'GenerateProposalStep';
    }
}
exports.GenerateProposalStep = GenerateProposalStep;
//# sourceMappingURL=generate-proposal.step.js.map