"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentStrategy = exports.DeploymentStatus = exports.DeploymentEnvironment = void 0;
var DeploymentEnvironment;
(function (DeploymentEnvironment) {
    DeploymentEnvironment["DEVELOPMENT"] = "DEVELOPMENT";
    DeploymentEnvironment["TESTING"] = "TESTING";
    DeploymentEnvironment["STAGING"] = "STAGING";
    DeploymentEnvironment["PRODUCTION"] = "PRODUCTION";
})(DeploymentEnvironment || (exports.DeploymentEnvironment = DeploymentEnvironment = {}));
var DeploymentStatus;
(function (DeploymentStatus) {
    DeploymentStatus["PENDING"] = "PENDING";
    DeploymentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DeploymentStatus["SUCCESS"] = "SUCCESS";
    DeploymentStatus["FAILURE"] = "FAILURE";
    DeploymentStatus["ROLLED_BACK"] = "ROLLED_BACK";
})(DeploymentStatus || (exports.DeploymentStatus = DeploymentStatus = {}));
var DeploymentStrategy;
(function (DeploymentStrategy) {
    DeploymentStrategy["BLUE_GREEN"] = "BLUE_GREEN";
    DeploymentStrategy["ROLLING"] = "ROLLING";
    DeploymentStrategy["CANARY"] = "CANARY";
    DeploymentStrategy["FULL"] = "FULL";
})(DeploymentStrategy || (exports.DeploymentStrategy = DeploymentStrategy = {}));
//# sourceMappingURL=DeploymentConfig.js.map