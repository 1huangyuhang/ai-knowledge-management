"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIServiceImpl = void 0;
class APIServiceImpl {
    apiCaller;
    constructor(apiCaller) {
        this.apiCaller = apiCaller;
    }
    async executeLLMRequest(endpoint, body, params) {
        try {
            const response = await this.apiCaller.post(endpoint, body, params);
            return response.body;
        }
        catch (error) {
            throw error;
        }
    }
    async executeEmbeddingRequest(endpoint, body, params) {
        try {
            const response = await this.apiCaller.post(endpoint, body, params);
            return response.body;
        }
        catch (error) {
            throw error;
        }
    }
    healthCheck() {
        return this.apiCaller.healthCheck();
    }
}
exports.APIServiceImpl = APIServiceImpl;
//# sourceMappingURL=APIService.js.map