"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowError = void 0;
class WorkflowError extends Error {
    stepName;
    workflowName;
    constructor(message, workflowName, stepName) {
        super(message);
        this.name = 'WorkflowError';
        this.workflowName = workflowName;
        this.stepName = stepName;
    }
    getStepName() {
        return this.stepName;
    }
    getWorkflowName() {
        return this.workflowName;
    }
}
exports.WorkflowError = WorkflowError;
//# sourceMappingURL=workflow.error.js.map