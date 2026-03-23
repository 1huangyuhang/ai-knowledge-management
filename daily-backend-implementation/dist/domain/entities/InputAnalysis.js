"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisType = exports.AnalysisStatus = exports.InputAnalysis = void 0;
const UUID_1 = require("../value-objects/UUID");
class InputAnalysis {
    id;
    inputId;
    type;
    result;
    status;
    confidence;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id || UUID_1.UUID.generate();
        this.inputId = props.inputId;
        this.type = props.type;
        this.result = props.result;
        this.status = props.status;
        this.confidence = props.confidence;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    update(result, confidence, status) {
        return new InputAnalysis({
            ...this,
            result,
            confidence,
            status,
            updatedAt: new Date()
        });
    }
}
exports.InputAnalysis = InputAnalysis;
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "pending";
    AnalysisStatus["PROCESSING"] = "processing";
    AnalysisStatus["COMPLETED"] = "completed";
    AnalysisStatus["FAILED"] = "failed";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["KEYWORD_EXTRACTION"] = "keyword_extraction";
    AnalysisType["TOPIC_RECOGNITION"] = "topic_recognition";
    AnalysisType["SENTIMENT_ANALYSIS"] = "sentiment_analysis";
    AnalysisType["CONTENT_CLASSIFICATION"] = "content_classification";
    AnalysisType["SUMMARIZATION"] = "summarization";
    AnalysisType["ENTITY_RECOGNITION"] = "entity_recognition";
    AnalysisType["RELATION_EXTRACTION"] = "relation_extraction";
    AnalysisType["READABILITY_ANALYSIS"] = "readability_analysis";
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
//# sourceMappingURL=InputAnalysis.js.map