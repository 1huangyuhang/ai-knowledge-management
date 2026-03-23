"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportFormat = exports.EvolutionHistoryErrorType = exports.SnapshotType = exports.ModelEvolutionEventType = void 0;
var ModelEvolutionEventType;
(function (ModelEvolutionEventType) {
    ModelEvolutionEventType["MODEL_CREATED"] = "MODEL_CREATED";
    ModelEvolutionEventType["MODEL_UPDATED"] = "MODEL_UPDATED";
    ModelEvolutionEventType["CONCEPT_ADDED"] = "CONCEPT_ADDED";
    ModelEvolutionEventType["CONCEPT_UPDATED"] = "CONCEPT_UPDATED";
    ModelEvolutionEventType["CONCEPT_REMOVED"] = "CONCEPT_REMOVED";
    ModelEvolutionEventType["RELATION_ADDED"] = "RELATION_ADDED";
    ModelEvolutionEventType["RELATION_UPDATED"] = "RELATION_UPDATED";
    ModelEvolutionEventType["RELATION_REMOVED"] = "RELATION_REMOVED";
    ModelEvolutionEventType["MODEL_RESTRUCTURED"] = "MODEL_RESTRUCTURED";
    ModelEvolutionEventType["MODEL_VERSIONED"] = "MODEL_VERSIONED";
})(ModelEvolutionEventType || (exports.ModelEvolutionEventType = ModelEvolutionEventType = {}));
var SnapshotType;
(function (SnapshotType) {
    SnapshotType["AUTO"] = "AUTO";
    SnapshotType["MANUAL"] = "MANUAL";
    SnapshotType["VERSIONED"] = "VERSIONED";
    SnapshotType["BACKUP"] = "BACKUP";
})(SnapshotType || (exports.SnapshotType = SnapshotType = {}));
var EvolutionHistoryErrorType;
(function (EvolutionHistoryErrorType) {
    EvolutionHistoryErrorType["INVALID_EVENT_DATA"] = "INVALID_EVENT_DATA";
    EvolutionHistoryErrorType["SNAPSHOT_CREATION_FAILED"] = "SNAPSHOT_CREATION_FAILED";
    EvolutionHistoryErrorType["SNAPSHOT_RECOVERY_FAILED"] = "SNAPSHOT_RECOVERY_FAILED";
    EvolutionHistoryErrorType["VERSION_COMPARISON_FAILED"] = "VERSION_COMPARISON_FAILED";
    EvolutionHistoryErrorType["HISTORY_QUERY_FAILED"] = "HISTORY_QUERY_FAILED";
    EvolutionHistoryErrorType["DATA_CLEANUP_FAILED"] = "DATA_CLEANUP_FAILED";
    EvolutionHistoryErrorType["DATA_EXPORT_FAILED"] = "DATA_EXPORT_FAILED";
})(EvolutionHistoryErrorType || (exports.EvolutionHistoryErrorType = EvolutionHistoryErrorType = {}));
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["JSON"] = "JSON";
    ExportFormat["CSV"] = "CSV";
    ExportFormat["XML"] = "XML";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
//# sourceMappingURL=evolution-history.types.js.map