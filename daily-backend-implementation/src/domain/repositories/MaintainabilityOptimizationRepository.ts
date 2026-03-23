/**
 * 可维护性优化仓库接口
 * 定义可维护性相关数据的持久化和查询操作
 */
import { 
  MaintainabilityConfig, 
  CodeQualityIssue, 
  CodeQualityReport, 
  TechDebtItem, 
  DocumentationStatus, 
  MaintainabilityMetric, 
  MaintainabilityEvent 
} from '../entities/MaintainabilityConfig';

export interface MaintainabilityOptimizationRepository {
  /**
   * 保存可维护性配置
   * @param config 可维护性配置
   * @returns 保存后的可维护性配置
   */
  saveMaintainabilityConfig(config: MaintainabilityConfig): Promise<MaintainabilityConfig>;

  /**
   * 获取可维护性配置
   * @returns 可维护性配置
   */
  getMaintainabilityConfig(): Promise<MaintainabilityConfig>;

  /**
   * 保存代码质量报告
   * @param report 代码质量报告
   * @returns 保存后的代码质量报告
   */
  saveCodeQualityReport(report: CodeQualityReport): Promise<CodeQualityReport>;

  /**
   * 获取代码质量报告列表
   * @param limit 限制数量
   * @param moduleName 模块名称（可选）
   * @returns 代码质量报告列表
   */
  getCodeQualityReports(limit?: number, moduleName?: string): Promise<CodeQualityReport[]>;

  /**
   * 保存代码质量问题
   * @param issue 代码质量问题
   * @returns 保存后的代码质量问题
   */
  saveCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue>;

  /**
   * 批量保存代码质量问题
   * @param issues 代码质量问题列表
   * @returns 保存结果
   */
  saveCodeQualityIssues(issues: CodeQualityIssue[]): Promise<boolean>;

  /**
   * 获取代码质量问题列表
   * @param filters 过滤条件
   * @returns 代码质量问题列表
   */
  getCodeQualityIssues(filters?: { 
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
    fixed?: boolean;
    moduleName?: string;
  }): Promise<CodeQualityIssue[]>;

  /**
   * 更新代码质量问题
   * @param issue 代码质量问题
   * @returns 更新后的代码质量问题
   */
  updateCodeQualityIssue(issue: CodeQualityIssue): Promise<CodeQualityIssue>;

  /**
   * 保存技术债务
   * @param techDebt 技术债务项
   * @returns 保存后的技术债务项
   */
  saveTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem>;

  /**
   * 获取技术债务列表
   * @param filters 过滤条件
   * @returns 技术债务列表
   */
  getTechDebtItems(filters?: { 
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
    type?: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
  }): Promise<TechDebtItem[]>;

  /**
   * 更新技术债务
   * @param techDebt 技术债务项
   * @returns 更新后的技术债务项
   */
  updateTechDebt(techDebt: TechDebtItem): Promise<TechDebtItem>;

  /**
   * 保存文档状态
   * @param status 文档状态
   * @returns 保存后的文档状态
   */
  saveDocumentationStatus(status: DocumentationStatus): Promise<DocumentationStatus>;

  /**
   * 批量保存文档状态
   * @param statuses 文档状态列表
   * @returns 保存结果
   */
  saveDocumentationStatuses(statuses: DocumentationStatus[]): Promise<boolean>;

  /**
   * 获取文档状态列表
   * @returns 文档状态列表
   */
  getDocumentationStatuses(): Promise<DocumentationStatus[]>;

  /**
   * 保存可维护性指标
   * @param metric 可维护性指标
   * @returns 保存后的可维护性指标
   */
  saveMaintainabilityMetric(metric: MaintainabilityMetric): Promise<MaintainabilityMetric>;

  /**
   * 批量保存可维护性指标
   * @param metrics 可维护性指标列表
   * @returns 保存结果
   */
  saveMaintainabilityMetrics(metrics: MaintainabilityMetric[]): Promise<boolean>;

  /**
   * 获取可维护性指标列表
   * @param filters 过滤条件
   * @returns 可维护性指标列表
   */
  getMaintainabilityMetrics(filters?: { 
    type?: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
    moduleName?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<MaintainabilityMetric[]>;

  /**
   * 保存可维护性事件
   * @param event 可维护性事件
   * @returns 保存后的可维护性事件
   */
  saveMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent>;

  /**
   * 获取可维护性事件列表
   * @param filters 过滤条件
   * @returns 可维护性事件列表
   */
  getMaintainabilityEvents(filters?: { 
    type?: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
    processed?: boolean;
    moduleName?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<MaintainabilityEvent[]>;

  /**
   * 更新可维护性事件
   * @param event 可维护性事件
   * @returns 更新后的可维护性事件
   */
  updateMaintainabilityEvent(event: MaintainabilityEvent): Promise<MaintainabilityEvent>;

  /**
   * 清空所有数据（用于测试或重置）
   * @returns 清空结果
   */
  clearAllData(): Promise<boolean>;
}