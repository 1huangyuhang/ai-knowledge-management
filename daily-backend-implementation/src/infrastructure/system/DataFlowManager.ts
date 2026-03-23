/**
 * 数据转换器接口
 */
export interface DataTransformer<T, U> {
  /**
   * 转换数据
   * @param data 源数据
   */
  transform(data: T): Promise<U>;
}

/**
 * 数据验证结果接口
 */
export interface ValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;
  
  /**
   * 错误信息列表
   */
  errors: string[];
  
  /**
   * 验证时间
   */
  timestamp: string;
}

/**
 * 数据验证器接口
 */
export interface DataValidator<T> {
  /**
   * 验证数据
   * @param data 要验证的数据
   */
  validate(data: T): Promise<ValidationResult>;
}

/**
 * 数据流转管理器接口
 */
export interface DataFlowManager {
  /**
   * 注册数据转换器
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   * @param transformer 数据转换器
   */
  registerDataTransformer<T, U>(sourceModule: string, targetModule: string, transformer: DataTransformer<T, U>): Promise<void>;
  
  /**
   * 转换数据
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   * @param data 源数据
   */
  transformData<T, U>(sourceModule: string, targetModule: string, data: T): Promise<U>;
  
  /**
   * 注册数据验证器
   * @param moduleId 模块ID
   * @param validator 数据验证器
   */
  registerDataValidator<T>(moduleId: string, validator: DataValidator<T>): Promise<void>;
  
  /**
   * 验证数据
   * @param moduleId 模块ID
   * @param data 要验证的数据
   */
  validateData<T>(moduleId: string, data: T): Promise<ValidationResult>;
  
  /**
   * 移除数据转换器
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   */
  removeDataTransformer(sourceModule: string, targetModule: string): Promise<void>;
  
  /**
   * 移除数据验证器
   * @param moduleId 模块ID
   */
  removeDataValidator(moduleId: string): Promise<void>;
}

/**
 * 默认数据流转管理器实现
 */
export class DefaultDataFlowManager implements DataFlowManager {
  private transformers: Map<string, Map<string, DataTransformer<any, any>>> = new Map();
  private validators: Map<string, DataValidator<any>> = new Map();
  
  /**
   * 注册数据转换器
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   * @param transformer 数据转换器
   */
  async registerDataTransformer<T, U>(sourceModule: string, targetModule: string, transformer: DataTransformer<T, U>): Promise<void> {
    if (!this.transformers.has(sourceModule)) {
      this.transformers.set(sourceModule, new Map());
    }
    this.transformers.get(sourceModule)!.set(targetModule, transformer);
  }
  
  /**
   * 转换数据
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   * @param data 源数据
   */
  async transformData<T, U>(sourceModule: string, targetModule: string, data: T): Promise<U> {
    const sourceTransformers = this.transformers.get(sourceModule);
    if (!sourceTransformers) {
      throw new Error(`No transformers registered for source module ${sourceModule}`);
    }
    
    const transformer = sourceTransformers.get(targetModule);
    if (!transformer) {
      throw new Error(`No transformer registered from ${sourceModule} to ${targetModule}`);
    }
    
    return transformer.transform(data);
  }
  
  /**
   * 注册数据验证器
   * @param moduleId 模块ID
   * @param validator 数据验证器
   */
  async registerDataValidator<T>(moduleId: string, validator: DataValidator<T>): Promise<void> {
    this.validators.set(moduleId, validator);
  }
  
  /**
   * 验证数据
   * @param moduleId 模块ID
   * @param data 要验证的数据
   */
  async validateData<T>(moduleId: string, data: T): Promise<ValidationResult> {
    const validator = this.validators.get(moduleId);
    if (validator) {
      return validator.validate(data);
    }
    
    // 默认验证通过
    return {
      isValid: true,
      errors: [],
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 移除数据转换器
   * @param sourceModule 源模块ID
   * @param targetModule 目标模块ID
   */
  async removeDataTransformer(sourceModule: string, targetModule: string): Promise<void> {
    const sourceTransformers = this.transformers.get(sourceModule);
    if (sourceTransformers) {
      sourceTransformers.delete(targetModule);
      if (sourceTransformers.size === 0) {
        this.transformers.delete(sourceModule);
      }
    }
  }
  
  /**
   * 移除数据验证器
   * @param moduleId 模块ID
   */
  async removeDataValidator(moduleId: string): Promise<void> {
    this.validators.delete(moduleId);
  }
}

/**
 * 数据流转管理表单例实例
 */
export const dataFlowManager = new DefaultDataFlowManager();
