/**
 * 可维护性优化仓库实现
 * 基于内存的可维护性优化仓库，用于存储可维护性配置、代码质量报告、技术债务等
 */
import { 
  MaintainabilityOptimizationRepository 
} from '../../domain/repositories/MaintainabilityOptimizationRepository';
import { 
  MaintainabilityConfig, 
  CodeQualityIssue, 
  CodeQualityReport, 
  TechDebtItem, 
  DocumentationStatus, 
  MaintainabilityMetric, 
  MaintainabilityEvent 
} from '../../domain/entities/MaintainabilityConfig';

/**
 * 可维护性优化仓库实现类
 */
export class MaintainabilityOptimizationRepositoryImpl implements MaintainabilityOptimizationRepository {
  // 内存存储
  private maintainabilityConfig: MaintainabilityConfig | null = null;
  private codeQualityReports: CodeQualityReport[] = [];
  private codeQualityIssues: CodeQualityIssue[] = [];
  private techDebts: TechDebtItem[] = [];
  private documentationStatuses: DocumentationStatus[] = [];
  private maintainabilityMetrics: MaintainabilityMetric[] = [];
  private maintainabilityEvents: MaintainabilityEvent[] = [];

  /**
   * 保存可维护性配置
   * @param config 可维护性配置
   * @returns 保存后的可维护性配置
   */
  async saveMaintainabilityConfig(config: MaintainabilityConfig): Promise<MaintainabilityConfig> {
    this.maintainabilityConfig = config;
    return config;
  }

  /**
   * 获取可维护性配置
   * @returns 可维护性配置
   */
  async getMaintainabilityConfig(): Promise<MaintainabilityConfig> {
    if (!this.maintainabilityConfig) {
      throw new Error('Maintainability config not found');
    }
    return this.maintainabilityConfig;
  }

  /**
   * 保存代码质量报告
   * @param report 代码质量报告
   * @returns 保存后的代码质量报告
   */
  async saveCodeQualityReport(report: CodeQualityReport): Promise<CodeQualityReport> {
    this.codeQualityReports.push(report);
    return report;
  }

  /**
   * 获取代码质量报告列表
   * @param limit 限制数量
   * @param moduleName 模块名称（可选）
   * @returns 代码质量报告列表
   */
  async getCodeQualityReports(limit?: number, moduleName?: string): Promise<CodeQualityReport[]> {
    let reports = [...this.codeQualityReports];
    
    // 如果有模块名称过滤，这里可以添加过滤逻辑
    // 目前模拟实现，没有按模块分组
    
    // 按时间倒序排序
    reports.sort((a, b) => b.reportTime.getTime() - a.reportTime.getTime());
    
    // 如果有限制数量，返回前N个
    if (limit) {
      reports = reports.slice(0, limit);
    }
    
    return reports;
  }

  /**
   * 保存代码质量问题
   * @param issue 代码质量问题
   * @returns 保存后的代码质量问题
   */
  async saveCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue> {
    this.codeQualityIssues.push(issue);
    return issue;
  }

  /**
   * 批量保存代码质量问题
   * @param issues 代码质量问题列表
   * @returns 保存结果
   */
  async saveCodeQualityIssues(issues: CodeQualityIssue[]): Promise<boolean> {
    this.codeQualityIssues.push(...issues);
    return true;
  }

  /**
   * 获取代码质量问题列表
   * @param filters 过滤条件
   * @returns 代码质量问题列表
   */
  async getCodeQualityIssues(filters?: { 
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
    fixed?: boolean;
    moduleName?: string;
  }): Promise<CodeQualityIssue[]> {
    let issues = [...this.codeQualityIssues];
    
    // 应用过滤条件
    if (filters) {
      if (filters.severity) {
        issues = issues.filter(issue => issue.severity === filters.severity);
      }
      if (filters.fixed !== undefined) {
        issues = issues.filter(issue => issue.fixed === filters.fixed);
      }
      // 模块名称过滤目前未实现
    }
    
    return issues;
  }

  /**
   * 更新代码质量问题
   * @param issue 代码质量问题
   * @returns 更新后的代码质量问题
   */
  async updateCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue> {
    const index = this.codeQualityIssues.findIndex(i => i.id === issue.id);
    if (index !== -1) {
      this.codeQualityIssues[index] = issue;
    }
    return issue;
  }

  /**
   * 保存技术债务
   * @param techDebt 技术债务项
   * @returns 保存后的技术债务项
   */
  async saveTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem> {
    this.techDebts.push(techDebt);
    return techDebt;
  }

  /**
   * 获取技术债务列表
   * @param filters 过滤条件
   * @returns 技术债务列表
   */
  async getTechDebtItems(filters?: { 
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
    type?: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
  }): Promise<TechDebtItem[]> {
    let techDebts = [...this.techDebts];
    
    // 应用过滤条件
    if (filters) {
      if (filters.severity) {
        techDebts = techDebts.filter(td => td.severity === filters.severity);
      }
      if (filters.status) {
        techDebts = techDebts.filter(td => td.status === filters.status);
      }
      if (filters.type) {
        techDebts = techDebts.filter(td => td.type === filters.type);
      }
    }
    
    return techDebts;
  }

  /**
   * 更新技术债务
   * @param techDebt 技术债务项
   * @returns 更新后的技术债务项
   */
  async updateTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem> {
    const index = this.techDebts.findIndex(td => td.id === techDebt.id);
    if (index !== -1) {
      this.techDebts[index] = techDebt;
    }
    return techDebt;
  }

  /**
   * 保存文档状态
   * @param status 文档状态
   * @returns 保存后的文档状态
   */
  async saveDocumentationStatus(status: DocumentationStatus): Promise<DocumentationStatus> {
    const existingIndex = this.documentationStatuses.findIndex(s => s.type === status.type);
    if (existingIndex !== -1) {
      this.documentationStatuses[existingIndex] = status;
    } else {
      this.documentationStatuses.push(status);
    }
    return status;
  }

  /**
   * 批量保存文档状态
   * @param statuses 文档状态列表
   * @returns 保存结果
   */
  async saveDocumentationStatuses(statuses: DocumentationStatus[]): Promise<boolean> {
    for (const status of statuses) {
      await this.saveDocumentationStatus(status);
    }
    return true;
  }

  /**
   * 获取文档状态列表
   * @returns 文档状态列表
   */
  async getDocumentationStatuses(): Promise<DocumentationStatus[]> {
    return [...this.documentationStatuses];
  }

  /**
   * 保存可维护性指标
   * @param metric 可维护性指标
   * @returns 保存后的可维护性指标
   */
  async saveMaintainabilityMetric(metric: MaintainabilityMetric): Promise<MaintainabilityMetric> {
    this.maintainabilityMetrics.push(metric);
    return metric;
  }

  /**
   * 批量保存可维护性指标
   * @param metrics 可维护性指标列表
   * @returns 保存结果
   */
  async saveMaintainabilityMetrics(metrics: MaintainabilityMetric[]): Promise<boolean> {
    this.maintainabilityMetrics.push(...metrics);
    return true;
  }

  /**
   * 获取可维护性指标列表
   * @param filters 过滤条件
   * @returns 可维护性指标列表
   */
  async getMaintainabilityMetrics(filters?: { 
    type?: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
    moduleName?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<MaintainabilityMetric[]> {
    let metrics = [...this.maintainabilityMetrics];
    
    // 应用过滤条件
    if (filters) {
      if (filters.type) {
        metrics = metrics.filter(metric => metric.type === filters.type);
      }
      if (filters.moduleName) {
        metrics = metrics.filter(metric => metric.moduleName === filters.moduleName);
      }
      if (filters.startTime) {
        metrics = metrics.filter(metric => metric.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        metrics = metrics.filter(metric => metric.timestamp <= filters.endTime!);
      }
    }
    
    return metrics;
  }

  /**
   * 保存可维护性事件
   * @param event 可维护性事件
   * @returns 保存后的可维护性事件
   */
  async saveMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent> {
    this.maintainabilityEvents.push(event);
    return event;
  }

  /**
   * 获取可维护性事件列表
   * @param filters 过滤条件
   * @returns 可维护性事件列表
   */
  async getMaintainabilityEvents(filters?: { 
    type?: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
    processed?: boolean;
    moduleName?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<MaintainabilityEvent[]> {
    let events = [...this.maintainabilityEvents];
    
    // 应用过滤条件
    if (filters) {
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      if (filters.processed !== undefined) {
        events = events.filter(event => event.processed === filters.processed);
      }
      if (filters.moduleName) {
        events = events.filter(event => event.moduleName === filters.moduleName);
      }
      if (filters.startTime) {
        events = events.filter(event => event.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        events = events.filter(event => event.timestamp <= filters.endTime!);
      }
    }
    
    return events;
  }

  /**
   * 更新可维护性事件
   * @param event 可维护性事件
   * @returns 更新后的可维护性事件
   */
  async updateMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent> {
    const index = this.maintainabilityEvents.findIndex(e => e.id === event.id);
    if (index !== -1) {
      this.maintainabilityEvents[index] = event;
    }
    return event;
  }

  /**
   * 清空所有数据（用于测试或重置）
   * @returns 清空结果
   */
  async clearAllData(): Promise<boolean> {
    this.maintainabilityConfig = null;
    this.codeQualityReports = [];
    this.codeQualityIssues = [];
    this.techDebts = [];
    this.documentationStatuses = [];
    this.maintainabilityMetrics = [];
    this.maintainabilityEvents = [];
    return true;
  }
}
