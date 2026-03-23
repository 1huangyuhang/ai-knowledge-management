"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIDependencyConfig = void 0;
const ApiCallServiceFactory_1 = require("../../../infrastructure/ai/api/ApiCallServiceFactory");
class APIDependencyConfig {
    static configure(container) {
        container.registerSingleton(ApiCallService_1.ApiCallService, () => {
            const loggerService = container.resolve('LoggerService');
            return ApiCallServiceFactory_1.ApiCallServiceFactory.createService({
                apiKey: process.env.OPENAI_API_KEY || ''
            }, loggerService);
        });
    }
}
exports.APIDependencyConfig = APIDependencyConfig;
//# sourceMappingURL=APIDependencyConfig.js.map