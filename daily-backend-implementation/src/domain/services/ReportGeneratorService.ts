import { UUID } from '../value-objects/UUID';
import { OptimizationReport } from '../entities/OptimizationReport';

export interface ReportOptions {
  format: 'html' | 'json' | 'console' | 'pdf';
  includeDetails?: boolean;
  includeMetrics?: boolean;
  includeSuggestions?: boolean;
  includeOptimizations?: boolean;
  includeTrends?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'severity' | 'impact' | 'date';
  filterBy?: {
    severity?: string[];
    type?: string[];
    status?: string[];
  };
}

export interface ReportGeneratorService {
  /**
   * 生成优化报告
   */
  generateReport(projectId: string, options?: ReportOptions): Promise<OptimizationReport>;

  /**
   * 生成分析报告
   */
  generateAnalysisReport(analysisId: UUID, options?: ReportOptions): Promise<OptimizationReport>;

  /**
   * 获取报告详情
   */
  getReportById(id: UUID): Promise<OptimizationReport | null>;

  /**
   * 获取项目的报告列表
   */
  getReportsByProject(projectId: string): Promise<OptimizationReport[]>;

  /**
   * 导出报告
   */
  exportReport(reportId: UUID, format: string): Promise<Buffer>;

  /**
   * 生成趋势报告
   */
  generateTrendReport(projectId: string, options?: ReportOptions): Promise<OptimizationReport>;

  /**
   * 删除报告
   */
  deleteReport(id: UUID): Promise<boolean>;

  /**
   * 批量生成报告
   */
  batchGenerateReports(projectIds: string[], options?: ReportOptions): Promise<OptimizationReport[]>;
}
