// src/infrastructure/system/ConfigManager.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * LLM配置接口
 */
export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * 配置管理器选项
 */
export interface ConfigManagerOptions {
  configPath?: string;
  environment?: string;
}

/**
 * 配置管理器
 * 负责加载和管理系统配置
 */
export class ConfigManager {
  private readonly configPath: string;
  private readonly environment: string;
  private config: Record<string, any> = {};
  private isLoaded = false;

  /**
   * 创建配置管理器
   * @param options 配置管理器选项
   */
  constructor(options: ConfigManagerOptions = {}) {
    this.configPath = options.configPath || './config';
    this.environment = options.environment || process.env.NODE_ENV || 'development';
  }

  /**
   * 加载配置
   */
  public async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      // 加载环境变量
      this.loadEnvironmentVariables();

      // 加载配置文件
      await this.loadConfigFiles();

      this.isLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${(error as Error).message}`);
    }
  }

  /**
   * 加载环境变量
   */
  private loadEnvironmentVariables(): void {
    // 从环境变量中加载配置
    const envConfig: Record<string, any> = {};

    // 加载所有环境变量
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        envConfig[key] = value;
      }
    }

    this.config = { ...this.config, ...envConfig };
  }

  /**
   * 加载配置文件
   */
  private async loadConfigFiles(): Promise<void> {
    try {
      // 检查配置目录是否存在
      if (!fs.existsSync(this.configPath)) {
        // 配置目录不存在，使用默认配置
        return;
      }

      // 加载基础配置文件
      const baseConfigPath = path.join(this.configPath, 'default.json');
      if (fs.existsSync(baseConfigPath)) {
        const baseConfig = JSON.parse(await fs.promises.readFile(baseConfigPath, 'utf-8'));
        this.config = { ...this.config, ...baseConfig };
      }

      // 加载环境特定配置文件
      const envConfigPath = path.join(this.configPath, `${this.environment}.json`);
      if (fs.existsSync(envConfigPath)) {
        const envConfig = JSON.parse(await fs.promises.readFile(envConfigPath, 'utf-8'));
        this.config = { ...this.config, ...envConfig };
      }
    } catch (error) {
      throw new Error(`Failed to load config files: ${(error as Error).message}`);
    }
  }

  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  public get<T>(key: string, defaultValue?: T): T {
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

    return value as T;
  }

  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  public set(key: string, value: any): void {
    if (!this.isLoaded) {
      throw new Error('ConfigManager not loaded yet');
    }

    this.config[key] = value;
  }

  /**
   * 获取所有配置
   * @returns 所有配置
   */
  public getAll(): Record<string, any> {
    if (!this.isLoaded) {
      throw new Error('ConfigManager not loaded yet');
    }

    return { ...this.config };
  }

  /**
   * 检查配置键是否存在
   * @param key 配置键
   * @returns 是否存在
   */
  public has(key: string): boolean {
    if (!this.isLoaded) {
      throw new Error('ConfigManager not loaded yet');
    }

    return this.config[key] !== undefined;
  }

  /**
   * 获取LLM配置
   * @returns LLM配置
   */
  public getLLMConfig(): LLMConfig {
    if (!this.isLoaded) {
      throw new Error('ConfigManager not loaded yet');
    }

    return {
      apiKey: this.get<string>('OPENAI_API_KEY', ''),
      baseUrl: this.get<string>('LLM_BASE_URL', 'https://api.openai.com/v1'),
      model: this.get<string>('LLM_MODEL', 'gpt-4o-mini'),
      temperature: this.get<number>('LLM_TEMPERATURE', 0.7),
      maxTokens: this.get<number>('LLM_MAX_TOKENS', 2000)
    };
  }

  /**
   * 重新加载配置
   */
  public async reload(): Promise<void> {
    this.isLoaded = false;
    await this.load();
  }
}