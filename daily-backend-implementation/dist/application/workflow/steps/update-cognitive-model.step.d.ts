import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { UpdateCognitiveModelUseCase } from '../../use-cases/cognitive/update-model.use-case';
import { CognitiveModelDto } from '../../dtos/cognitive-model.dto';
export declare class UpdateCognitiveModelStep implements WorkflowStep<void, CognitiveModelDto> {
    private readonly updateCognitiveModelUseCase;
    constructor(updateCognitiveModelUseCase: UpdateCognitiveModelUseCase);
    execute(_: void, context: WorkflowContext): Promise<CognitiveModelDto>;
    getName(): string;
}
//# sourceMappingURL=update-cognitive-model.step.d.ts.map