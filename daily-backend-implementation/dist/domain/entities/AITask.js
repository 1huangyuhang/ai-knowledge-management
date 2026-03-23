"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITask = exports.AITaskStatus = exports.AITaskPriority = exports.AITaskType = void 0;
const UUID_1 = require("../value-objects/UUID");
var AITaskType;
(function (AITaskType) {
    AITaskType["FILE_PROCESSING"] = "FILE_PROCESSING";
    AITaskType["SPEECH_PROCESSING"] = "SPEECH_PROCESSING";
    AITaskType["COGNITIVE_ANALYSIS"] = "COGNITIVE_ANALYSIS";
    AITaskType["EMBEDDING_GENERATION"] = "EMBEDDING_GENERATION";
    AITaskType["RELATION_INFERENCE"] = "RELATION_INFERENCE";
    AITaskType["INSIGHT_GENERATION"] = "INSIGHT_GENERATION";
    AITaskType["THEME_ANALYSIS"] = "THEME_ANALYSIS";
    AITaskType["BLINDSPOT_DETECTION"] = "BLINDSPOT_DETECTION";
    AITaskType["GAP_IDENTIFICATION"] = "GAP_IDENTIFICATION";
})(AITaskType || (exports.AITaskType = AITaskType = {}));
var AITaskPriority;
(function (AITaskPriority) {
    AITaskPriority["URGENT"] = "urgent";
    AITaskPriority["HIGH"] = "high";
    AITaskPriority["MEDIUM"] = "medium";
    AITaskPriority["LOW"] = "low";
})(AITaskPriority || (exports.AITaskPriority = AITaskPriority = {}));
var AITaskStatus;
(function (AITaskStatus) {
    AITaskStatus["PENDING"] = "pending";
    AITaskStatus["RUNNING"] = "running";
    AITaskStatus["SUCCEEDED"] = "succeeded";
    AITaskStatus["FAILED"] = "failed";
    AITaskStatus["CANCELLED"] = "cancelled";
    AITaskStatus["TIMEOUT"] = "timeout";
})(AITaskStatus || (exports.AITaskStatus = AITaskStatus = {}));
class AITask {
    id;
    type;
    priority;
    status;
    inputData;
    result;
    error;
    retryCount;
    maxRetries;
    createdAt;
    updatedAt;
    startedAt;
    completedAt;
    estimatedExecutionTime;
    actualExecutionTime;
    userId;
    cognitiveModelId;
    dependsOn;
    constructor(props) {
        this.id = props.id || UUID_1.UUID.generate();
        this.type = props.type;
        this.priority = props.priority;
        this.status = props.status || AITaskStatus.PENDING;
        this.inputData = props.inputData;
        this.result = props.result || null;
        this.error = props.error || null;
        this.retryCount = props.retryCount || 0;
        this.maxRetries = props.maxRetries || 3;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
        this.startedAt = props.startedAt || null;
        this.completedAt = props.completedAt || null;
        this.estimatedExecutionTime = props.estimatedExecutionTime || null;
        this.actualExecutionTime = props.actualExecutionTime || null;
        this.userId = props.userId || null;
        this.cognitiveModelId = props.cognitiveModelId || null;
        this.dependsOn = props.dependsOn || [];
    }
    start() {
        this.status = AITaskStatus.RUNNING;
        this.startedAt = new Date();
        this.updatedAt = new Date();
    }
    succeed(result) {
        this.status = AITaskStatus.SUCCEEDED;
        this.result = result;
        this.completedAt = new Date();
        this.actualExecutionTime = this.startedAt
            ? this.completedAt.getTime() - this.startedAt.getTime()
            : null;
        this.updatedAt = new Date();
    }
    fail(error) {
        this.status = AITaskStatus.FAILED;
        this.error = error;
        this.completedAt = new Date();
        this.actualExecutionTime = this.startedAt
            ? this.completedAt.getTime() - this.startedAt.getTime()
            : null;
        this.retryCount += 1;
        this.updatedAt = new Date();
    }
    cancel() {
        this.status = AITaskStatus.CANCELLED;
        this.completedAt = new Date();
        this.actualExecutionTime = this.startedAt
            ? this.completedAt.getTime() - this.startedAt.getTime()
            : null;
        this.updatedAt = new Date();
    }
    timeout() {
        this.status = AITaskStatus.TIMEOUT;
        this.error = 'Task execution timed out';
        this.completedAt = new Date();
        this.actualExecutionTime = this.startedAt
            ? this.completedAt.getTime() - this.startedAt.getTime()
            : null;
        this.retryCount += 1;
        this.updatedAt = new Date();
    }
    retry() {
        this.status = AITaskStatus.PENDING;
        this.updatedAt = new Date();
        this.startedAt = null;
        this.completedAt = null;
        this.actualExecutionTime = null;
    }
    canRetry() {
        return this.retryCount < this.maxRetries;
    }
}
exports.AITask = AITask;
//# sourceMappingURL=AITask.js.map