import { WorkflowContext } from './workflow-context.interface';
export interface WorkflowStep<TInput, TOutput> {
    execute(input: TInput, context: WorkflowContext): Promise<TOutput>;
    getName(): string;
}
//# sourceMappingURL=workflow-step.interface.d.ts.map