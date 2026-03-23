/**
 * LLM 客户端配置
 */
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

/**
 * LLM 请求参数
 */
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

/**
 * LLM 响应
 */
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

/**
 * LLM 客户端接口
 */
export interface LLMClient {
  /**
   * 发送请求到 LLM
   * @param request LLM 请求参数
   * @returns LLM 响应
   */
  sendRequest(request: LLMRequest): Promise<LLMResponse>;

  /**
   * 生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 生成的文本
   */
  generateText(prompt: string, options?: Partial<LLMRequest>): Promise<string>;

  /**
   * 流式生成文本
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 文本流
   */
  streamText(prompt: string, options?: Partial<LLMRequest>): AsyncGenerator<string, void, unknown>;
}