/**
 * 可维护性优化服务接口
 * 定义可维护性优化相关的核心业务逻辑
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

export interface MaintainabilityOptimizationService {
  /**
   * 获取可维护性配置
   * @returns 可维护性配置
   */
  getMaintainabilityConfig(): Promise<MaintainabilityConfig>;

  /**
   * 更新可维护性配置
   * @param config 可维护性配置
   * @returns 更新后的可维护性配置
   */
  updateMaintainabilityConfig(config: MaintainabilityConfig): Promise<MaintainabilityConfig>;

  /**
   * 应用可维护性配置
   * @param configId 配置ID
   * @returns 应用结果
   */
  applyMaintainabilityConfig(configId: string): Promise<boolean>;

  /**
   * 运行静态代码分析
   * @param moduleName 模块名称（可选）
   * @returns 代码质量报告
   */
  runStaticCodeAnalysis(moduleName?: string): Promise<CodeQualityReport>;

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
   * 修复代码质量问题
   * @param issueId 问题ID
   * @param fixedBy 修复人
   * @returns 修复结果
   */
  fixCodeQualityIssue(issueId: string, fixedBy: string): Promise<boolean>;

  /**
   * 获取代码质量报告历史
   * @param limit 限制数量
   * @param moduleName 模块名称（可选）
   * @returns 代码质量报告列表
   */
  getCodeQualityReportHistory(limit?: number, moduleName?: string): Promise<CodeQualityReport[]>;

  /**
   * 添加技术债务
   * @param techDebt 技术债务项
   * @returns 添加的技术债务
   */
  addTechDebt(techDebt: Omit<TechDebtItem, 'id' | 'createdAt'>): Promise<TechDebtItem>;

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
   * 更新技术债务状态
   * @param techDebtId 技术债务ID
   * @param status 新状态
   * @param resolvedBy 解决人（可选）
   * @returns 更新后的技术债务
   */
  updateTechDebtStatus(techDebtId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED', resolvedBy?: string): Promise<TechDebtItem>;

  /**
   * 获取文档状态
   * @returns 文档状态列表
   */
  getDocumentationStatus(): Promise<DocumentationStatus[]>;

  /**
   * 更新文档状态
   * @param documentationStatus 文档状态
   * @returns 更新后的文档状态
   */
  updateDocumentationStatus(documentationStatus: DocumentationStatus): Promise<DocumentationStatus>;

  /**
   * 检查依赖更新
   * @returns 需要更新的依赖列表
   */
  checkDependencyUpdates(): Promise<Record<string, any>[]>;

  /**
   * 获取可维护性指标
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
   * 记录可维护性事件
   * @param event 可维护性事件
   * @returns 记录的事件
   */
  recordMaintainabilityEvent(event: Omit<MaintainabilityEvent, 'id' | 'timestamp' | 'processed'>): Promise<MaintainabilityEvent>;

  /**
   * 获取可维护性事件
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
   * 标记事件为已处理
   * @param eventId 事件ID
   * @returns 处理结果
   */
  markEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 生成可维护性报告
   * @param period 报告期间（天数）
   * @returns 可维护性报告
   */
  generateMaintainabilityReport(period: number): Promise<Record<string, any>>;

  /**
   * 获取技术债务估算
   * @returns 技术债务估算结果
   */
  getTechDebtEstimate(): Promise<{ totalHours: number; breakdown: Record<string, number> }>;

  /**
   * 优化代码质量规则
   * @returns 优化建议
   */
  optimizeCodeQualityRules(): Promise<Record<string, any>>;

  /**
   * 检查架构合规性
   * @returns 架构合规性结果
   */
  checkArchitectureCompliance(): Promise<Record<string, any>>;
}