import { WorkflowStatus } from './workflow-status.enum';
export interface WorkflowContext {
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    getStatus(): WorkflowStatus;
    setStatus(status: WorkflowStatus): void;
}
//# sourceMappingURL=workflow-context.interface.d.ts.map