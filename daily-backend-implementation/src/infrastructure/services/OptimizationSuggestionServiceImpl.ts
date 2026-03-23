import { OptimizationSuggestionService } from '../../domain/services/OptimizationSuggestionService';
import { OptimizationSuggestion, SuggestionType } from '../../domain/entities/OptimizationSuggestion';
import { CodeAnalysis } from '../../domain/entities/CodeAnalysis';
import { UUID } from '../../domain/value-objects/UUID';

export class OptimizationSuggestionServiceImpl implements OptimizationSuggestionService {
  /**
   * 为代码分析生成优化建议
   */
  async generateSuggestions(analysis: CodeAnalysis): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // 分析代码问题并生成建议
    for (const issue of analysis.issues) {
      const suggestion = this.generateSuggestionForIssue(analysis, issue);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // 分析代码指标并生成建议
    for (const metric of analysis.metrics) {
      const metricSuggestion = this.generateSuggestionForMetric(analysis, metric);
      if (metricSuggestion) {
        suggestions.push(metricSuggestion);
      }
    }

    return suggestions;
  }

  /**
   * 获取优化建议详情
   */
  async getSuggestionById(id: UUID): Promise<OptimizationSuggestion | null> {
    // 这里应该从数据库获取，但现在我们先返回null
    return null;
  }

  /**
   * 获取代码分析的优化建议列表
   */
  async getSuggestionsByAnalysis(analysisId: UUID): Promise<OptimizationSuggestion[]> {
    // 这里应该从数据库获取，但现在我们先返回空列表
    return [];
  }

  /**
   * 为代码问题生成优化建议
   */
  private generateSuggestionForIssue(analysis: CodeAnalysis, issue: any): OptimizationSuggestion | null {
    // 根据问题类型生成不同的建议
    let suggestionType: SuggestionType;
    let description: string;
    let recommendation: string;

    switch (issue.ruleId) {
      case 'no-unused-vars':
        suggestionType = SuggestionType.CODE_CLEANUP;
        description = `移除未使用的变量: ${issue.message}`;
        recommendation = `删除第 ${issue.line} 行的未使用变量，或在代码中使用它。`;
        break;
      case 'prefer-const':
        suggestionType = SuggestionType.PERFORMANCE;
        description = `使用const替代let: ${issue.message}`;
        recommendation = `将第 ${issue.line} 行的let声明改为const，因为该变量的值不会改变。`;
        break;
      case 'no-console':
        suggestionType = SuggestionType.CODE_CLEANUP;
        description = `移除控制台日志: ${issue.message}`;
        recommendation = `删除第 ${issue.line} 行的console语句，或在生产环境中禁用它们。`;
        break;
      case 'no-unreachable-code':
        suggestionType = SuggestionType.CODE_CLEANUP;
        description = `移除不可达代码: ${issue.message}`;
        recommendation = `删除第 ${issue.line} 行的不可达代码，因为它永远不会被执行。`;
        break;
      default:
        suggestionType = SuggestionType.GENERAL;
        description = `代码优化建议: ${issue.message}`;
        recommendation = `按照ESLint规则修复第 ${issue.line} 行的问题。`;
    }

    const suggestion = OptimizationSuggestion.create({
      id: UUID.generate(),
      analysisId: analysis.id,
      type: suggestionType,
      description,
      recommendation,
      severity: issue.severity,
      line: issue.line,
      column: issue.column,
      filePath: analysis.filePath,
      ruleId: issue.ruleId,
      isFixable: issue.fixable || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (suggestion.isFailure) {
      return null;
    }

    return suggestion.getValue();
  }

  /**
   * 为代码指标生成优化建议
   */
  private generateSuggestionForMetric(analysis: CodeAnalysis, metric: any): OptimizationSuggestion | null {
    // 检查指标是否超过阈值
    if (metric.value > metric.threshold.max) {
      let suggestionType: SuggestionType;
      let description: string;
      let recommendation: string;

      switch (metric.name) {
        case 'eslint_errors':
          suggestionType = SuggestionType.CODE_CLEANUP;
          description = `ESLint错误数量超过阈值`;
          recommendation = `修复代码中的${metric.value}个ESLint错误，当前阈值为${metric.threshold.max}。`;
          break;
        case 'eslint_warnings':
          suggestionType = SuggestionType.GENERAL;
          description = `ESLint警告数量超过阈值`;
          recommendation = `考虑修复代码中的${metric.value}个ESLint警告，当前阈值为${metric.threshold.max}。`;
          break;
        case 'eslint_issues':
          suggestionType = SuggestionType.GENERAL;
          description = `ESLint问题总数超过阈值`;
          recommendation = `修复代码中的${metric.value}个ESLint问题，当前阈值为${metric.threshold.max}。`;
          break;
        default:
          return null;
      }

      const suggestion = OptimizationSuggestion.create({
        id: UUID.generate(),
        analysisId: analysis.id,
        type: suggestionType,
        description,
        recommendation,
        severity: 'MEDIUM',
        line: 0,
        column: 0,
        filePath: analysis.filePath,
        ruleId: metric.name,
        isFixable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (suggestion.isFailure) {
        return null;
      }

      return suggestion.getValue();
    }

    return null;
  }
}
