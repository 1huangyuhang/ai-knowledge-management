"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeIssue = exports.SeverityLevel = void 0;
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "LOW";
    SeverityLevel["MEDIUM"] = "MEDIUM";
    SeverityLevel["HIGH"] = "HIGH";
    SeverityLevel["CRITICAL"] = "CRITICAL";
})(SeverityLevel || (exports.SeverityLevel = SeverityLevel = {}));
class CodeIssue {
    id;
    ruleId;
    severity;
    message;
    line;
    column;
    fixable;
    suggestion;
    constructor(id, ruleId, severity, message, line, column, fixable, suggestion) {
        this.id = id;
        this.ruleId = ruleId;
        this.severity = severity;
        this.message = message;
        this.line = line;
        this.column = column;
        this.fixable = fixable;
        this.suggestion = suggestion;
    }
    getId() {
        return this.id;
    }
    getRuleId() {
        return this.ruleId;
    }
    getSeverity() {
        return this.severity;
    }
    getMessage() {
        return this.message;
    }
    getLine() {
        return this.line;
    }
    getColumn() {
        return this.column;
    }
    isFixable() {
        return this.fixable;
    }
    getSuggestion() {
        return this.suggestion;
    }
}
exports.CodeIssue = CodeIssue;
//# sourceMappingURL=CodeIssue.js.map