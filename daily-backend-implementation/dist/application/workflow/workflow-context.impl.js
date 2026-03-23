"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowContextImpl = void 0;
const workflow_status_enum_1 = require("../interfaces/workflow/workflow-status.enum");
class WorkflowContextImpl {
    data = new Map();
    status = workflow_status_enum_1.WorkflowStatus.PENDING;
    set(key, value) {
        this.data.set(key, value);
    }
    get(key) {
        return this.data.get(key);
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
}
exports.WorkflowContextImpl = WorkflowContextImpl;
//# sourceMappingURL=workflow-context.impl.js.map