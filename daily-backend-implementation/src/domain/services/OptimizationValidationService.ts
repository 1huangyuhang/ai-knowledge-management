import { UUID } from '../value-objects/UUID';
import { Optimization } from '../entities/Optimization';
import { ValidationResult } from '../entities/Optimization';

export interface OptimizationValidationService {
  /**
   * 验证优化结果
   */
  validateOptimization(optimization: Optimization): Promise<ValidationResult>;

  /**
   * 验证代码变更
   */
  validateCodeChanges(changes: any[]): Promise<ValidationResult>;

  /**
   * 验证代码质量指标
   */
  validateCodeMetrics(filePath: string, metrics: any[]): Promise<ValidationResult>;

  /**
   * 运行测试验证
   */
  runTestValidation(filePath: string, changes: any[]): Promise<ValidationResult>;

  /**
   * 验证类型安全性
   */
  validateTypeSafety(filePath: string): Promise<ValidationResult>;

  /**
   * 验证性能影响
   */
  validatePerformanceImpact(filePath: string, changes: any[]): Promise<ValidationResult>;

  /**
   * 验证安全影响
   */
  validateSecurityImpact(filePath: string, changes: any[]): Promise<ValidationResult>;

  /**
   * 生成验证报告
   */
  generateValidationReport(results: ValidationResult[]): Promise<string>;
}
