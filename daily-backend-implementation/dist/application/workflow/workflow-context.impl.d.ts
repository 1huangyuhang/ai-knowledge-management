import { WorkflowContext } from '../interfaces/workflow/workflow-context.interface';
import { WorkflowStatus } from '../interfaces/workflow/workflow-status.enum';
export declare class WorkflowContextImpl implements WorkflowContext {
    private readonly data;
    private status;
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    getStatus(): WorkflowStatus;
    setStatus(status: WorkflowStatus): void;
}
//# sourceMappingURL=workflow-context.impl.d.ts.map