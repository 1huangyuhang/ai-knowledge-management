import { WorkflowFactory } from '../workflow/workflow-factory';
import { CreateThoughtDto } from '../dtos/create-thought.dto';
import { CognitiveModelDto } from '../dtos/cognitive-model.dto';
export declare class CognitiveProcessingService {
    private readonly workflowFactory;
    constructor(workflowFactory: WorkflowFactory);
    processThought(input: CreateThoughtDto): Promise<CognitiveModelDto>;
}
//# sourceMappingURL=cognitive-processing.service.d.ts.map