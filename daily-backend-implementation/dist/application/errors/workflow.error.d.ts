export declare class WorkflowError extends Error {
    private readonly stepName;
    private readonly workflowName;
    constructor(message: string, workflowName: string, stepName: string);
    getStepName(): string;
    getWorkflowName(): string;
}
//# sourceMappingURL=workflow.error.d.ts.map