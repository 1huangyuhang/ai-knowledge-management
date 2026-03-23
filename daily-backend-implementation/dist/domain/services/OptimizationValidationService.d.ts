import { Optimization } from '../entities/Optimization';
import { ValidationResult } from '../entities/Optimization';
export interface OptimizationValidationService {
    validateOptimization(optimization: Optimization): Promise<ValidationResult>;
    validateCodeChanges(changes: any[]): Promise<ValidationResult>;
    validateCodeMetrics(filePath: string, metrics: any[]): Promise<ValidationResult>;
    runTestValidation(filePath: string, changes: any[]): Promise<ValidationResult>;
    validateTypeSafety(filePath: string): Promise<ValidationResult>;
    validatePerformanceImpact(filePath: string, changes: any[]): Promise<ValidationResult>;
    validateSecurityImpact(filePath: string, changes: any[]): Promise<ValidationResult>;
    generateValidationReport(results: ValidationResult[]): Promise<string>;
}
//# sourceMappingURL=OptimizationValidationService.d.ts.map