"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCallServiceFactory = void 0;
const HttpApiCallService_1 = require("./HttpApiCallService");
const ApiCallConfig_1 = require("./ApiCallConfig");
class ApiCallServiceFactory {
    static createService(config, logger) {
        const fullConfig = { ...ApiCallConfig_1.DEFAULT_API_CALL_CONFIG, ...config };
        return new HttpApiCallService_1.HttpApiCallService(fullConfig.baseUrl, fullConfig.apiKey, logger, fullConfig.defaultTimeout);
    }
}
exports.ApiCallServiceFactory = ApiCallServiceFactory;
//# sourceMappingURL=ApiCallServiceFactory.js.map