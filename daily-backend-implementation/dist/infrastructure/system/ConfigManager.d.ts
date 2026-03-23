export interface LLMConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
    maxTokens: number;
}
export interface ConfigManagerOptions {
    configPath?: string;
    environment?: string;
}
export declare class ConfigManager {
    private readonly configPath;
    private readonly environment;
    private config;
    private isLoaded;
    constructor(options?: ConfigManagerOptions);
    load(): Promise<void>;
    private loadEnvironmentVariables;
    private loadConfigFiles;
    get<T>(key: string, defaultValue?: T): T;
    set(key: string, value: any): void;
    getAll(): Record<string, any>;
    has(key: string): boolean;
    getLLMConfig(): LLMConfig;
    reload(): Promise<void>;
}
//# sourceMappingURL=ConfigManager.d.ts.map