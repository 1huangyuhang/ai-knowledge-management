"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelWorkflow = void 0;
const create_thought_use_case_1 = require("../use-cases/thought/create-thought.use-case");
const generate_proposal_use_case_1 = require("../use-cases/ai/generate-proposal.use-case");
const update_model_use_case_1 = require("../use-cases/cognitive/update-model.use-case");
class CognitiveModelWorkflow {
    createThoughtUseCase;
    generateProposalUseCase;
    updateModelUseCase;
    constructor(thoughtFragmentRepository, cognitiveModelRepository) {
        this.createThoughtUseCase = new create_thought_use_case_1.CreateThoughtUseCase(thoughtFragmentRepository);
        this.generateProposalUseCase = new generate_proposal_use_case_1.GenerateProposalUseCase(thoughtFragmentRepository);
        this.updateModelUseCase = new update_model_use_case_1.UpdateModelUseCase(cognitiveModelRepository);
    }
    async executeProcessThoughtFragmentWorkflow(input) {
        try {
            const createThoughtResult = await this.createThoughtUseCase.execute({
                userId: input.userId,
                content: input.content,
                source: input.source
            });
            const thoughtFragmentId = createThoughtResult.thoughtFragment.id;
            const generateProposalResult = await this.generateProposalUseCase.execute({
                userId: input.userId,
                thoughtFragmentIds: [thoughtFragmentId]
            });
            const proposalId = generateProposalResult.proposal.id;
            return {
                thoughtFragmentId,
                proposalId,
                status: 'success',
                message: 'Thought fragment processed successfully'
            };
        }
        catch (error) {
            if (error.message.includes('THOUGHT_FRAGMENT_CREATED')) {
                return {
                    thoughtFragmentId: error.thoughtFragmentId,
                    status: 'partial_success',
                    message: `Thought fragment created but failed to process: ${error.message}`
                };
            }
            return {
                thoughtFragmentId: '',
                status: 'failed',
                message: `Failed to process thought fragment: ${error.message}`
            };
        }
    }
    async executeBatchProcessThoughtFragmentWorkflow(inputs) {
        const results = [];
        for (const input of inputs) {
            const result = await this.executeProcessThoughtFragmentWorkflow(input);
            results.push(result);
        }
        return results;
    }
}
exports.CognitiveModelWorkflow = CognitiveModelWorkflow;
//# sourceMappingURL=cognitive-model.workflow.js.map