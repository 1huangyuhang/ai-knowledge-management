import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { CodeIssue, SeverityLevel } from '../../domain/entities/CodeIssue';

const execAsync = promisify(exec);

export interface ESLintAnalysisResult {
  success: boolean;
  issues: CodeIssue[];
  metrics: any[];
  stats: {
    errors: number;
    warnings: number;
    files: number;
    time: number;
  };
}

export class ESLintAnalyzer {
  private readonly eslintConfigPath: string;

  constructor() {
    this.eslintConfigPath = join(process.cwd(), '.eslintrc.json');
  }

  /**
   * 使用ESLint分析代码
   */
  async analyze(filePath: string): Promise<ESLintAnalysisResult> {
    try {
      const result = await execAsync(`npx eslint ${filePath} --format json --config ${this.eslintConfigPath}`);
      const eslintOutput = JSON.parse(result.stdout);

      const issues: CodeIssue[] = [];
      const metrics: any[] = [];
      let errors = 0;
      let warnings = 0;

      for (const fileResult of eslintOutput) {
        for (const message of fileResult.messages) {
          const severity = this.mapESLintSeverity(message.severity);
          
          if (severity === SeverityLevel.HIGH || severity === SeverityLevel.CRITICAL) {
            errors++;
          } else {
            warnings++;
          }

          const issue: CodeIssue = {
            id: `${message.ruleId}-${message.line}-${message.column}`,
            ruleId: message.ruleId,
            severity,
            message: message.message,
            line: message.line,
            column: message.column,
            fixable: message.fixable || false,
            suggestion: message.suggestions?.map((s: any) => s.desc).join('; ') || undefined
          };
          issues.push(issue);
        }
      }

      // 收集基本指标
      metrics.push({
        name: 'eslint_errors',
        value: errors,
        unit: 'count',
        description: 'ESLint错误数量',
        threshold: {
          optimal: 0,
          max: 0,
          unit: 'count'
        }
      });

      metrics.push({
        name: 'eslint_warnings',
        value: warnings,
        unit: 'count',
        description: 'ESLint警告数量',
        threshold: {
          optimal: 0,
          max: 5,
          unit: 'count'
        }
      });

      metrics.push({
        name: 'eslint_issues',
        value: errors + warnings,
        unit: 'count',
        description: 'ESLint问题总数',
        threshold: {
          optimal: 0,
          max: 10,
          unit: 'count'
        }
      });

      return {
        success: true,
        issues,
        metrics,
        stats: {
          errors,
          warnings,
          files: eslintOutput.length,
          time: eslintOutput[0]?.time || 0
        }
      };
    } catch (error: any) {
      // 如果ESLint命令执行失败，返回空结果
      return {
        success: false,
        issues: [],
        metrics: [],
        stats: {
          errors: 0,
          warnings: 0,
          files: 0,
          time: 0
        }
      };
    }
  }

  /**
   * 批量分析多个文件
   */
  async analyzeMultiple(filePaths: string[]): Promise<Map<string, ESLintAnalysisResult>> {
    const results = new Map<string, ESLintAnalysisResult>();

    for (const filePath of filePaths) {
      const result = await this.analyze(filePath);
      results.set(filePath, result);
    }

    return results;
  }

  /**
   * 将ESLint严重性映射到我们的SeverityLevel
   */
  private mapESLintSeverity(eslintSeverity: number): SeverityLevel {
    switch (eslintSeverity) {
      case 2: // error
        return SeverityLevel.CRITICAL;
      case 1: // warning
        return SeverityLevel.MEDIUM;
      default:
        return SeverityLevel.LOW;
    }
  }
}
