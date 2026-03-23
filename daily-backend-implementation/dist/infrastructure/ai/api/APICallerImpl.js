"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APICallerImpl = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class APICallerImpl {
    axiosInstance;
    config;
    logger;
    errorHandler;
    constructor(config, logger, errorHandler) {
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            ...config,
        };
        this.logger = logger;
        this.errorHandler = errorHandler;
        this.axiosInstance = axios_1.default.create({
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async call(request) {
        const retryConfig = {
            retries: 0,
            maxRetries: this.config.maxRetries,
            retryDelay: this.config.retryDelay,
        };
        return this.callWithRetry(request, retryConfig);
    }
    async callWithRetry(request, retryConfig) {
        try {
            this.logger.info('Executing API call', {
                endpoint: request.endpoint,
                method: request.method || 'GET',
                attempt: retryConfig.retries + 1,
            });
            const startTime = Date.now();
            const axiosConfig = {
                url: request.endpoint,
                method: request.method || 'GET',
                data: request.body,
                headers: request.headers,
                params: request.params,
            };
            const response = await this.axiosInstance.request(axiosConfig);
            const endTime = Date.now();
            const latency = endTime - startTime;
            this.logger.info('API call successful', {
                endpoint: request.endpoint,
                method: request.method || 'GET',
                statusCode: response.status,
                latency,
            });
            return {
                statusCode: response.status,
                body: response.data,
                headers: this.convertHeaders(response.headers),
                latency,
            };
        }
        catch (error) {
            this.logger.error('API call failed', {
                endpoint: request.endpoint,
                method: request.method || 'GET',
                error: error.message,
                attempt: retryConfig.retries + 1,
                maxRetries: retryConfig.maxRetries,
            });
            if (retryConfig.retries < retryConfig.maxRetries) {
                const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.retries);
                this.logger.info(`Retrying API call in ${delay}ms`, {
                    endpoint: request.endpoint,
                    method: request.method || 'GET',
                    attempt: retryConfig.retries + 1,
                    maxRetries: retryConfig.maxRetries,
                });
                await this.delay(delay);
                return this.callWithRetry(request, {
                    ...retryConfig,
                    retries: retryConfig.retries + 1,
                });
            }
            const apiError = {
                message: error.message || 'API call failed',
                statusCode: error.response?.status,
                type: error.code || 'api_error',
                originalError: error,
            };
            this.errorHandler.handle(error, { context: 'api-call' });
            throw apiError;
        }
    }
    async get(endpoint, params, headers) {
        return this.call({
            endpoint,
            method: 'GET',
            params,
            headers,
        });
    }
    async post(endpoint, body, params, headers) {
        return this.call({
            endpoint,
            method: 'POST',
            body,
            params,
            headers,
        });
    }
    async put(endpoint, body, params, headers) {
        return this.call({
            endpoint,
            method: 'PUT',
            body,
            params,
            headers,
        });
    }
    async delete(endpoint, params, headers) {
        return this.call({
            endpoint,
            method: 'DELETE',
            params,
            headers,
        });
    }
    getConfig() {
        return this.config;
    }
    healthCheck() {
        return !!this.axiosInstance;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    convertHeaders(headers) {
        const convertedHeaders = {};
        for (const [key, value] of Object.entries(headers)) {
            if (typeof value === 'string') {
                convertedHeaders[key] = value;
            }
            else if (value !== undefined && value !== null) {
                convertedHeaders[key] = String(value);
            }
        }
        return convertedHeaders;
    }
}
exports.APICallerImpl = APICallerImpl;
//# sourceMappingURL=APICallerImpl.js.map