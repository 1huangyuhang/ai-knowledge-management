export interface LLMClientConfig {
    apiKey: string;
    baseUrl?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}
export interface LLMRequest {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stop?: string[];
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}
export interface LLMResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finishReason: string;
    }[];
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface LLMClient {
    sendRequest(request: LLMRequest): Promise<LLMResponse>;
    generateText(prompt: string, options?: Partial<LLMRequest>): Promise<string>;
    streamText(prompt: string, options?: Partial<LLMRequest>): AsyncGenerator<string, void, unknown>;
}
//# sourceMappingURL=LLMClient.d.ts.map