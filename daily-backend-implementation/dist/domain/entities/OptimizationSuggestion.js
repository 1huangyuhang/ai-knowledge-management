"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationSuggestion = exports.SuggestionType = void 0;
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["PERFORMANCE"] = "PERFORMANCE";
    SuggestionType["READABILITY"] = "READABILITY";
    SuggestionType["SECURITY"] = "SECURITY";
    SuggestionType["MAINTAINABILITY"] = "MAINTAINABILITY";
    SuggestionType["SIZE"] = "SIZE";
})(SuggestionType || (exports.SuggestionType = SuggestionType = {}));
class OptimizationSuggestion {
    id;
    analysisId;
    issueId;
    suggestionType;
    description;
    implementation;
    expectedImpact;
    createdAt;
    constructor(id, analysisId, issueId, suggestionType, description, implementation, expectedImpact, createdAt) {
        this.id = id;
        this.analysisId = analysisId;
        this.issueId = issueId;
        this.suggestionType = suggestionType;
        this.description = description;
        this.implementation = implementation;
        this.expectedImpact = expectedImpact;
        this.createdAt = createdAt;
    }
    getId() {
        return this.id;
    }
    getAnalysisId() {
        return this.analysisId;
    }
    getIssueId() {
        return this.issueId;
    }
    getSuggestionType() {
        return this.suggestionType;
    }
    getDescription() {
        return this.description;
    }
    getImplementation() {
        return this.implementation;
    }
    getExpectedImpact() {
        return { ...this.expectedImpact };
    }
    getCreatedAt() {
        return this.createdAt;
    }
}
exports.OptimizationSuggestion = OptimizationSuggestion;
//# sourceMappingURL=OptimizationSuggestion.js.map