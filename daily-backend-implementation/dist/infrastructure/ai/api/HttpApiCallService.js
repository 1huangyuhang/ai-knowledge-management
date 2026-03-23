"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpApiCallService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class HttpApiCallService {
    defaultTimeout;
    axiosInstance;
    logger;
    constructor(baseUrl, apiKey, logger, defaultTimeout = 30000) {
        this.defaultTimeout = defaultTimeout;
        this.logger = logger;
        this.axiosInstance = axios_1.default.create({
            baseURL: baseUrl,
            timeout: defaultTimeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        });
        this.axiosInstance.interceptors.request.use((config) => {
            this.logger.debug(`Sending request to ${config.url}`, { method: config.method });
            return config;
        }, (error) => {
            this.logger.error('Request configuration error', { error: error.message });
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            this.logger.debug(`Received response from ${response.config.url}`, { status: response.status });
            return response;
        }, (error) => {
            this.logger.error('Response error', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return Promise.reject(error);
        });
    }
    async sendRequest(request) {
        return this.sendRequestWithTimeout(request, this.defaultTimeout);
    }
    async sendRequestWithTimeout(request, timeoutMs) {
        try {
            const config = {
                url: '/chat/completions',
                method: 'POST',
                data: {
                    model: request.model,
                    messages: request.messages,
                    temperature: request.temperature,
                    max_tokens: request.maxTokens,
                    top_p: request.topP,
                    frequency_penalty: request.frequencyPenalty,
                    presence_penalty: request.presencePenalty,
                    stream: request.stream
                },
                timeout: timeoutMs
            };
            const response = await this.axiosInstance(config);
            return this.mapResponse(response.data);
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    async checkServiceHealth() {
        try {
            const response = await this.axiosInstance.get('/health');
            return response.status === 200;
        }
        catch (error) {
            this.logger.error('API health check failed', { error: error.message });
            return false;
        }
    }
    mapResponse(data) {
        return {
            id: data.id,
            object: data.object,
            created: data.created,
            model: data.model,
            choices: data.choices.map((choice) => ({
                index: choice.index,
                message: {
                    role: choice.message.role,
                    content: choice.message.content
                },
                finishReason: choice.finish_reason
            })),
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            }
        };
    }
    handleApiError(error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                this.logger.error('API request timed out');
            }
            else if (error.response) {
                this.logger.error('API returned an error', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            else if (error.request) {
                this.logger.error('No response received from API');
            }
        }
        else {
            this.logger.error('Unexpected API error', { error: error.message });
        }
    }
}
exports.HttpApiCallService = HttpApiCallService;
//# sourceMappingURL=HttpApiCallService.js.map