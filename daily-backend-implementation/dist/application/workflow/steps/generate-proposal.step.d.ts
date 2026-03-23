import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { GenerateProposalUseCase } from '../../use-cases/cognitive/generate-proposal.use-case';
import { CognitiveProposalDto } from '../../dtos/cognitive-proposal.dto';
export declare class GenerateProposalStep implements WorkflowStep<void, CognitiveProposalDto> {
    private readonly generateProposalUseCase;
    constructor(generateProposalUseCase: GenerateProposalUseCase);
    execute(_: void, context: WorkflowContext): Promise<CognitiveProposalDto>;
    getName(): string;
}
//# sourceMappingURL=generate-proposal.step.d.ts.map