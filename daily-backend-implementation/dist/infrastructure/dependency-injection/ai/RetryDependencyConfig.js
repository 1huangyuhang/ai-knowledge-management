"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryDependencyConfig = void 0;
const ApiCallServiceFactory_1 = require("../../../infrastructure/ai/api/ApiCallServiceFactory");
const RetryableApiCallService_1 = require("../../../infrastructure/ai/api/RetryableApiCallService");
const DefaultRetryService_1 = require("../../../application/ai/retry/DefaultRetryService");
class RetryDependencyConfig {
    static configure(container) {
        container.registerSingleton(RetryService_1.RetryService, () => {
            const loggerService = container.resolve('LoggerService');
            return new DefaultRetryService_1.DefaultRetryService(loggerService);
        });
        container.registerSingleton(ApiCallService_1.ApiCallService, () => {
            const loggerService = container.resolve('LoggerService');
            const retryService = container.resolve(RetryService_1.RetryService);
            const originalApiCallService = ApiCallServiceFactory_1.ApiCallServiceFactory.createService({
                apiKey: process.env.OPENAI_API_KEY || ''
            }, loggerService);
            return new RetryableApiCallService_1.RetryableApiCallService(originalApiCallService, retryService);
        });
    }
}
exports.RetryDependencyConfig = RetryDependencyConfig;
//# sourceMappingURL=RetryDependencyConfig.js.map