"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClientImpl = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class LLMClientImpl {
    axiosInstance;
    config;
    logger;
    errorHandler;
    constructor(config, logger, errorHandler) {
        this.config = {
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000,
            timeout: 30000,
            maxRetries: 3,
            retryDelay: 1000,
            ...config,
        };
        this.logger = logger;
        this.errorHandler = errorHandler;
        this.axiosInstance = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
        });
    }
    async sendRequest(request) {
        const retryConfig = {
            retries: 0,
            maxRetries: this.config.maxRetries || 3,
            retryDelay: this.config.retryDelay || 1000,
        };
        return this.sendRequestWithRetry(request, retryConfig);
    }
    async sendRequestWithRetry(request, retryConfig) {
        try {
            this.logger.info('Sending request to LLM', {
                model: request.model || this.config.model,
                promptLength: request.prompt.length,
                attempt: retryConfig.retries + 1,
            });
            const startTime = Date.now();
            const response = await this.axiosInstance.post('/chat/completions', {
                model: request.model || this.config.model,
                messages: [
                    { role: 'user', content: request.prompt },
                ],
                temperature: request.temperature || this.config.temperature,
                max_tokens: request.maxTokens || this.config.maxTokens,
                stop: request.stop,
                top_p: request.topP,
                frequency_penalty: request.frequencyPenalty,
                presence_penalty: request.presencePenalty,
            });
            const endTime = Date.now();
            this.logger.info('Received response from LLM', {
                model: response.data.model,
                promptTokens: response.data.usage.promptTokens,
                completionTokens: response.data.usage.completionTokens,
                totalTokens: response.data.usage.totalTokens,
                latency: endTime - startTime,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('LLM request failed', {
                error: error.message,
                attempt: retryConfig.retries + 1,
                maxRetries: retryConfig.maxRetries,
            });
            if (retryConfig.retries < retryConfig.maxRetries) {
                const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
                this.logger.info(`Retrying LLM request in ${delay}ms`, {
                    attempt: retryConfig.retries + 1,
                    maxRetries: retryConfig.maxRetries,
                });
                await this.delay(delay);
                return this.sendRequestWithRetry(request, {
                    ...retryConfig,
                    retries: retryConfig.retries + 1,
                });
            }
            this.errorHandler.handle(error, { context: 'llm-request' });
            throw new Error(`LLM request failed after ${retryConfig.maxRetries} attempts: ${error.message}`);
        }
    }
    async generateText(prompt, options) {
        const response = await this.sendRequest({
            prompt,
            ...options,
        });
        return response.choices[0]?.message.content || '';
    }
    async *streamText(prompt, options) {
        const retryConfig = {
            retries: 0,
            maxRetries: this.config.maxRetries || 3,
            retryDelay: this.config.retryDelay || 1000,
        };
        yield* this.streamTextWithRetry(prompt, options || {}, retryConfig);
    }
    async *streamTextWithRetry(prompt, options, retryConfig) {
        try {
            this.logger.info('Streaming request to LLM', {
                model: options.model || this.config.model,
                promptLength: prompt.length,
                attempt: retryConfig.retries + 1,
            });
            const startTime = Date.now();
            const response = await this.axiosInstance.post('/chat/completions', {
                model: options.model || this.config.model,
                messages: [
                    { role: 'user', content: prompt },
                ],
                temperature: options.temperature || this.config.temperature,
                max_tokens: options.maxTokens || this.config.maxTokens,
                stop: options.stop,
                top_p: options.topP,
                frequency_penalty: options.frequencyPenalty,
                presence_penalty: options.presencePenalty,
                stream: true,
            }, {
                responseType: 'stream',
            });
            const stream = response.data;
            let buffer = '';
            for await (const chunk of stream) {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim() === '')
                        continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            break;
                        }
                        try {
                            const json = JSON.parse(data);
                            const content = json.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        }
                        catch (error) {
                            this.logger.error('Error parsing stream data', { error: error.message });
                        }
                    }
                }
            }
            const endTime = Date.now();
            this.logger.info('Streaming completed', {
                model: options.model || this.config.model,
                latency: endTime - startTime,
            });
        }
        catch (error) {
            this.logger.error('LLM streaming failed', {
                error: error.message,
                attempt: retryConfig.retries + 1,
                maxRetries: retryConfig.maxRetries,
            });
            if (retryConfig.retries < retryConfig.maxRetries) {
                const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
                this.logger.info(`Retrying LLM streaming in ${delay}ms`, {
                    attempt: retryConfig.retries + 1,
                    maxRetries: retryConfig.maxRetries,
                });
                await this.delay(delay);
                yield* this.streamTextWithRetry(prompt, options, {
                    ...retryConfig,
                    retries: retryConfig.retries + 1,
                });
            }
            else {
                this.errorHandler.handle(error, { context: 'llm-streaming' });
                throw new Error(`LLM streaming failed after ${retryConfig.maxRetries} attempts: ${error.message}`);
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getModel() {
        return this.config.model;
    }
    getConfig() {
        return this.config;
    }
    healthCheck() {
        return !!this.config.apiKey && !!this.config.baseUrl && !!this.config.model;
    }
}
exports.LLMClientImpl = LLMClientImpl;
//# sourceMappingURL=LLMClientImpl.js.map