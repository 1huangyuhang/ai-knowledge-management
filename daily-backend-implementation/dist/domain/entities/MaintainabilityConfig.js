"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationType = exports.CodeQualityRule = exports.MaintainabilityLevel = void 0;
var MaintainabilityLevel;
(function (MaintainabilityLevel) {
    MaintainabilityLevel["LOW"] = "LOW";
    MaintainabilityLevel["MEDIUM"] = "MEDIUM";
    MaintainabilityLevel["HIGH"] = "HIGH";
    MaintainabilityLevel["CRITICAL"] = "CRITICAL";
})(MaintainabilityLevel || (exports.MaintainabilityLevel = MaintainabilityLevel = {}));
var CodeQualityRule;
(function (CodeQualityRule) {
    CodeQualityRule["CODE_COMPLEXITY"] = "CODE_COMPLEXITY";
    CodeQualityRule["CODE_DUPLICATION"] = "CODE_DUPLICATION";
    CodeQualityRule["CODE_LINES"] = "CODE_LINES";
    CodeQualityRule["COMMENT_COVERAGE"] = "COMMENT_COVERAGE";
    CodeQualityRule["NAMING_CONVENTION"] = "NAMING_CONVENTION";
    CodeQualityRule["DEPENDENCY_MANAGEMENT"] = "DEPENDENCY_MANAGEMENT";
    CodeQualityRule["ERROR_HANDLING"] = "ERROR_HANDLING";
    CodeQualityRule["LOGGING"] = "LOGGING";
    CodeQualityRule["TEST_COVERAGE"] = "TEST_COVERAGE";
    CodeQualityRule["ARCHITECTURE_COMPLIANCE"] = "ARCHITECTURE_COMPLIANCE";
})(CodeQualityRule || (exports.CodeQualityRule = CodeQualityRule = {}));
var DocumentationType;
(function (DocumentationType) {
    DocumentationType["API"] = "API";
    DocumentationType["ARCHITECTURE"] = "ARCHITECTURE";
    DocumentationType["DESIGN"] = "DESIGN";
    DocumentationType["DEPLOYMENT"] = "DEPLOYMENT";
    DocumentationType["OPERATION"] = "OPERATION";
    DocumentationType["TEST"] = "TEST";
    DocumentationType["TROUBLESHOOTING"] = "TROUBLESHOOTING";
    DocumentationType["CHANGELOG"] = "CHANGELOG";
})(DocumentationType || (exports.DocumentationType = DocumentationType = {}));
//# sourceMappingURL=MaintainabilityConfig.js.map