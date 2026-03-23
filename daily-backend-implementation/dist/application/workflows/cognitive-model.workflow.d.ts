import { ThoughtFragmentRepository } from '../../domain/repositories/thought-fragment-repository';
import { CognitiveModelRepository } from '../../domain/repositories/cognitive-model-repository';
export interface ProcessThoughtFragmentWorkflowInput {
    userId: string;
    content: string;
    source?: string;
}
export interface ProcessThoughtFragmentWorkflowOutput {
    thoughtFragmentId: string;
    proposalId?: string;
    updatedModelId?: string;
    status: 'success' | 'partial_success' | 'failed';
    message: string;
}
export declare class CognitiveModelWorkflow {
    private readonly createThoughtUseCase;
    private readonly generateProposalUseCase;
    private readonly updateModelUseCase;
    constructor(thoughtFragmentRepository: ThoughtFragmentRepository, cognitiveModelRepository: CognitiveModelRepository);
    executeProcessThoughtFragmentWorkflow(input: ProcessThoughtFragmentWorkflowInput): Promise<ProcessThoughtFragmentWorkflowOutput>;
    executeBatchProcessThoughtFragmentWorkflow(inputs: ProcessThoughtFragmentWorkflowInput[]): Promise<ProcessThoughtFragmentWorkflowOutput[]>;
}
//# sourceMappingURL=cognitive-model.workflow.d.ts.map