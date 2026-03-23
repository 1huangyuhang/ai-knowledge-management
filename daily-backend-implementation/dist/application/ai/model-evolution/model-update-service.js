"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelUpdateErrorType = exports.UpdateSource = exports.ModelUpdateType = void 0;
var ModelUpdateType;
(function (ModelUpdateType) {
    ModelUpdateType["INCREMENTAL"] = "INCREMENTAL";
    ModelUpdateType["FULL"] = "FULL";
    ModelUpdateType["RESTRUCTURE"] = "RESTRUCTURE";
})(ModelUpdateType || (exports.ModelUpdateType = ModelUpdateType = {}));
var UpdateSource;
(function (UpdateSource) {
    UpdateSource["AI_GENERATED"] = "AI_GENERATED";
    UpdateSource["USER_MANUAL"] = "USER_MANUAL";
    UpdateSource["SYSTEM_AUTOMATIC"] = "SYSTEM_AUTOMATIC";
})(UpdateSource || (exports.UpdateSource = UpdateSource = {}));
var ModelUpdateErrorType;
(function (ModelUpdateErrorType) {
    ModelUpdateErrorType["MODEL_NOT_FOUND"] = "MODEL_NOT_FOUND";
    ModelUpdateErrorType["INVALID_UPDATE_PROPOSAL"] = "INVALID_UPDATE_PROPOSAL";
    ModelUpdateErrorType["VERSION_INCOMPATIBLE"] = "VERSION_INCOMPATIBLE";
    ModelUpdateErrorType["MODEL_INCONSISTENT"] = "MODEL_INCONSISTENT";
    ModelUpdateErrorType["DATABASE_ERROR"] = "DATABASE_ERROR";
    ModelUpdateErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ModelUpdateErrorType || (exports.ModelUpdateErrorType = ModelUpdateErrorType = {}));
//# sourceMappingURL=model-update-service.js.map