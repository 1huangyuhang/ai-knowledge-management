"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITask = exports.AITaskType = exports.AITaskPriority = exports.AITaskStatus = void 0;
const uuid_1 = require("../value-objects/uuid");
var AITaskStatus;
(function (AITaskStatus) {
    AITaskStatus["PENDING"] = "pending";
    AITaskStatus["IN_PROGRESS"] = "in_progress";
    AITaskStatus["COMPLETED"] = "completed";
    AITaskStatus["FAILED"] = "failed";
})(AITaskStatus || (exports.AITaskStatus = AITaskStatus = {}));
var AITaskPriority;
(function (AITaskPriority) {
    AITaskPriority["LOW"] = "low";
    AITaskPriority["MEDIUM"] = "medium";
    AITaskPriority["HIGH"] = "high";
    AITaskPriority["URGENT"] = "urgent";
})(AITaskPriority || (exports.AITaskPriority = AITaskPriority = {}));
var AITaskType;
(function (AITaskType) {
    AITaskType["FILE_PROCESSING"] = "file_processing";
    AITaskType["SPEECH_PROCESSING"] = "speech_processing";
    AITaskType["COGNITIVE_ANALYSIS"] = "cognitive_analysis";
    AITaskType["INSIGHT_GENERATION"] = "insight_generation";
    AITaskType["MODEL_UPDATE"] = "model_update";
})(AITaskType || (exports.AITaskType = AITaskType = {}));
class AITask {
    _id;
    _type;
    _status;
    _priority;
    _input;
    _output;
    _error;
    _createdAt;
    _updatedAt;
    _completedAt;
    _userId;
    constructor(props) {
        this._id = props.id || uuid_1.UUID.create();
        this._type = props.type;
        this._status = props.status || AITaskStatus.PENDING;
        this._priority = props.priority || AITaskPriority.MEDIUM;
        this._input = props.input;
        this._output = props.output;
        this._error = props.error;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        this._completedAt = props.completedAt;
        this._userId = props.userId;
    }
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get status() {
        return this._status;
    }
    get priority() {
        return this._priority;
    }
    get input() {
        return this._input;
    }
    get output() {
        return this._output;
    }
    get error() {
        return this._error;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get completedAt() {
        return this._completedAt;
    }
    get userId() {
        return this._userId;
    }
    start() {
        this._status = AITaskStatus.IN_PROGRESS;
        this._updatedAt = new Date();
    }
    complete(output) {
        this._status = AITaskStatus.COMPLETED;
        this._output = output;
        this._completedAt = new Date();
        this._updatedAt = new Date();
    }
    fail(error) {
        this._status = AITaskStatus.FAILED;
        this._error = error;
        this._updatedAt = new Date();
    }
    updatePriority(priority) {
        this._priority = priority;
        this._updatedAt = new Date();
    }
}
exports.AITask = AITask;
//# sourceMappingURL=ai-task.js.map