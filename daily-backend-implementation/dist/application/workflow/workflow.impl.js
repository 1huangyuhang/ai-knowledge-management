"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowImpl = void 0;
const workflow_context_impl_1 = require("./workflow-context.impl");
const workflow_status_enum_1 = require("../interfaces/workflow/workflow-status.enum");
const workflow_error_1 = require("../errors/workflow.error");
class WorkflowImpl {
    steps = [];
    name;
    constructor(name) {
        this.name = name;
    }
    async execute(input) {
        const context = new workflow_context_impl_1.WorkflowContextImpl();
        context.setStatus(workflow_status_enum_1.WorkflowStatus.RUNNING);
        try {
            let result = input;
            for (const step of this.steps) {
                try {
                    result = await step.execute(result, context);
                }
                catch (error) {
                    const stepName = step.getName();
                    throw new workflow_error_1.WorkflowError(`Step execution failed: ${error instanceof Error ? error.message : String(error)}`, this.name, stepName);
                }
            }
            context.setStatus(workflow_status_enum_1.WorkflowStatus.COMPLETED);
            return result;
        }
        catch (error) {
            context.setStatus(workflow_status_enum_1.WorkflowStatus.FAILED);
            throw error;
        }
    }
    getName() {
        return this.name;
    }
    addStep(step) {
        this.steps.push(step);
    }
}
exports.WorkflowImpl = WorkflowImpl;
//# sourceMappingURL=workflow.impl.js.map