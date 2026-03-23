import { Workflow } from '../interfaces/workflow/workflow.interface';
import { IngestThoughtUseCase } from '../use-cases/thought/create-thought.use-case';
import { GenerateProposalUseCase } from '../use-cases/cognitive/generate-proposal.use-case';
import { UpdateCognitiveModelUseCase } from '../use-cases/cognitive/update-model.use-case';
import { CreateThoughtDto } from '../dtos/create-thought.dto';
import { CognitiveModelDto } from '../dtos/cognitive-model.dto';
export declare class WorkflowFactory {
    private readonly ingestThoughtUseCase;
    private readonly generateProposalUseCase;
    private readonly updateCognitiveModelUseCase;
    constructor(ingestThoughtUseCase: IngestThoughtUseCase, generateProposalUseCase: GenerateProposalUseCase, updateCognitiveModelUseCase: UpdateCognitiveModelUseCase);
    createCognitiveProcessingWorkflow(): Workflow<CreateThoughtDto, CognitiveModelDto>;
}
//# sourceMappingURL=workflow-factory.d.ts.map