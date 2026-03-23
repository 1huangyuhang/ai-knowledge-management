import { WorkflowStep } from './workflow-step.interface';
export interface Workflow<TInput, TOutput> {
    execute(input: TInput): Promise<TOutput>;
    getName(): string;
    addStep(step: WorkflowStep<any, any>): void;
}
//# sourceMappingURL=workflow.interface.d.ts.map