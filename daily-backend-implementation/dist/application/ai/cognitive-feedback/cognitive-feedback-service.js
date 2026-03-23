"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionItemType = exports.PriorityLevel = exports.FeedbackType = exports.GapType = exports.SeverityLevel = exports.ImpactScope = exports.BlindspotType = void 0;
var BlindspotType;
(function (BlindspotType) {
    BlindspotType["CONCEPT_MISSING"] = "CONCEPT_MISSING";
    BlindspotType["RELATION_MISSING"] = "RELATION_MISSING";
    BlindspotType["HIERARCHY_MISSING"] = "HIERARCHY_MISSING";
    BlindspotType["BALANCE_MISSING"] = "BALANCE_MISSING";
    BlindspotType["DEPTH_MISSING"] = "DEPTH_MISSING";
})(BlindspotType || (exports.BlindspotType = BlindspotType = {}));
var ImpactScope;
(function (ImpactScope) {
    ImpactScope["LOCAL"] = "LOCAL";
    ImpactScope["GLOBAL"] = "GLOBAL";
    ImpactScope["CRITICAL"] = "CRITICAL";
})(ImpactScope || (exports.ImpactScope = ImpactScope = {}));
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "LOW";
    SeverityLevel["MEDIUM"] = "MEDIUM";
    SeverityLevel["HIGH"] = "HIGH";
})(SeverityLevel || (exports.SeverityLevel = SeverityLevel = {}));
var GapType;
(function (GapType) {
    GapType["KNOWLEDGE_GAP"] = "KNOWLEDGE_GAP";
    GapType["UNDERSTANDING_GAP"] = "UNDERSTANDING_GAP";
    GapType["APPLICATION_GAP"] = "APPLICATION_GAP";
    GapType["CONNECTION_GAP"] = "CONNECTION_GAP";
    GapType["PERSPECTIVE_GAP"] = "PERSPECTIVE_GAP";
})(GapType || (exports.GapType = GapType = {}));
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["INSIGHT"] = "INSIGHT";
    FeedbackType["SUGGESTION"] = "SUGGESTION";
    FeedbackType["WARNING"] = "WARNING";
    FeedbackType["SUMMARY"] = "SUMMARY";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "LOW";
    PriorityLevel["MEDIUM"] = "MEDIUM";
    PriorityLevel["HIGH"] = "HIGH";
    PriorityLevel["URGENT"] = "URGENT";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var ActionItemType;
(function (ActionItemType) {
    ActionItemType["EXPLORE"] = "EXPLORE";
    ActionItemType["LEARN"] = "LEARN";
    ActionItemType["CONNECT"] = "CONNECT";
    ActionItemType["REFLECT"] = "REFLECT";
    ActionItemType["APPLY"] = "APPLY";
})(ActionItemType || (exports.ActionItemType = ActionItemType = {}));
//# sourceMappingURL=cognitive-feedback-service.js.map