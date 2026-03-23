import { Workflow, WorkflowStep } from '../interfaces/workflow/workflow.interface';
export declare class WorkflowImpl<TInput, TOutput> implements Workflow<TInput, TOutput> {
    private readonly steps;
    private readonly name;
    constructor(name: string);
    execute(input: TInput): Promise<TOutput>;
    getName(): string;
    addStep(step: WorkflowStep<any, any>): void;
}
//# sourceMappingURL=workflow.impl.d.ts.map