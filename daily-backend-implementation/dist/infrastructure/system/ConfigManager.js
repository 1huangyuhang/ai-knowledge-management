"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
class ConfigManager {
    configPath;
    environment;
    config = {};
    isLoaded = false;
    constructor(options = {}) {
        this.configPath = options.configPath || './config';
        this.environment = options.environment || process.env.NODE_ENV || 'development';
    }
    async load() {
        if (this.isLoaded) {
            return;
        }
        try {
            this.loadEnvironmentVariables();
            await this.loadConfigFiles();
            this.isLoaded = true;
        }
        catch (error) {
            throw new Error(`Failed to load configuration: ${error.message}`);
        }
    }
    loadEnvironmentVariables() {
        const envConfig = {};
        for (const [key, value] of Object.entries(process.env)) {
            if (value !== undefined) {
                envConfig[key] = value;
            }
        }
        this.config = { ...this.config, ...envConfig };
    }
    async loadConfigFiles() {
        try {
            if (!fs.existsSync(this.configPath)) {
                return;
            }
            const baseConfigPath = path.join(this.configPath, 'default.json');
            if (fs.existsSync(baseConfigPath)) {
                const baseConfig = JSON.parse(await fs.promises.readFile(baseConfigPath, 'utf-8'));
                this.config = { ...this.config, ...baseConfig };
            }
            const envConfigPath = path.join(this.configPath, `${this.environment}.json`);
            if (fs.existsSync(envConfigPath)) {
                const envConfig = JSON.parse(await fs.promises.readFile(envConfigPath, 'utf-8'));
                this.config = { ...this.config, ...envConfig };
            }
        }
        catch (error) {
            throw new Error(`Failed to load config files: ${error.message}`);
        }
    }
    get(key, defaultValue) {
        if (!this.isLoaded) {
            throw new Error('ConfigManager not loaded yet');
        }
        const value = this.config[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Config key not found: ${key}`);
            }
            return defaultValue;
        }
        return value;
    }
    set(key, value) {
        if (!this.isLoaded) {
            throw new Error('ConfigManager not loaded yet');
        }
        this.config[key] = value;
    }
    getAll() {
        if (!this.isLoaded) {
            throw new Error('ConfigManager not loaded yet');
        }
        return { ...this.config };
    }
    has(key) {
        if (!this.isLoaded) {
            throw new Error('ConfigManager not loaded yet');
        }
        return this.config[key] !== undefined;
    }
    getLLMConfig() {
        if (!this.isLoaded) {
            throw new Error('ConfigManager not loaded yet');
        }
        return {
            apiKey: this.get('OPENAI_API_KEY', ''),
            baseUrl: this.get('LLM_BASE_URL', 'https://api.openai.com/v1'),
            model: this.get('LLM_MODEL', 'gpt-4o-mini'),
            temperature: this.get('LLM_TEMPERATURE', 0.7),
            maxTokens: this.get('LLM_MAX_TOKENS', 2000)
        };
    }
    async reload() {
        this.isLoaded = false;
        await this.load();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map