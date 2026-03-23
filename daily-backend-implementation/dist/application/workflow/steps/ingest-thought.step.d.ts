import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { IngestThoughtUseCase } from '../../use-cases/thought/create-thought.use-case';
import { CreateThoughtDto } from '../../dtos/create-thought.dto';
import { ThoughtDto } from '../../dtos/thought.dto';
export declare class IngestThoughtStep implements WorkflowStep<CreateThoughtDto, ThoughtDto> {
    private readonly ingestThoughtUseCase;
    constructor(ingestThoughtUseCase: IngestThoughtUseCase);
    execute(input: CreateThoughtDto, context: WorkflowContext): Promise<ThoughtDto>;
    getName(): string;
}
//# sourceMappingURL=ingest-thought.step.d.ts.map