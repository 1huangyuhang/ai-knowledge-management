/**
 * 可维护性配置实体
 * 表示系统的可维护性配置和策略
 */

export enum MaintainabilityLevel {
  /** 低可维护性级别 */
  LOW = 'LOW',
  /** 中可维护性级别 */
  MEDIUM = 'MEDIUM',
  /** 高可维护性级别 */
  HIGH = 'HIGH',
  /** 极高可维护性级别 */
  CRITICAL = 'CRITICAL'
}

export enum CodeQualityRule {
  /** 代码复杂度规则 */
  CODE_COMPLEXITY = 'CODE_COMPLEXITY',
  /** 代码重复规则 */
  CODE_DUPLICATION = 'CODE_DUPLICATION',
  /** 代码行数规则 */
  CODE_LINES = 'CODE_LINES',
  /** 注释覆盖率规则 */
  COMMENT_COVERAGE = 'COMMENT_COVERAGE',
  /** 命名规范规则 */
  NAMING_CONVENTION = 'NAMING_CONVENTION',
  /** 依赖管理规则 */
  DEPENDENCY_MANAGEMENT = 'DEPENDENCY_MANAGEMENT',
  /** 错误处理规则 */
  ERROR_HANDLING = 'ERROR_HANDLING',
  /** 日志记录规则 */
  LOGGING = 'LOGGING',
  /** 测试覆盖率规则 */
  TEST_COVERAGE = 'TEST_COVERAGE',
  /** 架构合规性规则 */
  ARCHITECTURE_COMPLIANCE = 'ARCHITECTURE_COMPLIANCE'
}

export enum DocumentationType {
  /** API文档 */
  API = 'API',
  /** 架构文档 */
  ARCHITECTURE = 'ARCHITECTURE',
  /** 设计文档 */
  DESIGN = 'DESIGN',
  /** 部署文档 */
  DEPLOYMENT = 'DEPLOYMENT',
  /** 操作文档 */
  OPERATION = 'OPERATION',
  /** 测试文档 */
  TEST = 'TEST',
  /** 故障排除文档 */
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  /** 变更日志 */
  CHANGELOG = 'CHANGELOG'
}

export interface CodeQualityRuleConfig {
  /** 规则类型 */
  ruleType: CodeQualityRule;
  /** 规则启用状态 */
  enabled: boolean;
  /** 规则阈值 */
  threshold: number;
  /** 规则严重程度 */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 规则描述 */
  description?: string;
  /** 规则配置参数 */
  config?: Record<string, any>;
}

export interface DocumentationConfig {
  /** 文档类型 */
  type: DocumentationType;
  /** 文档启用状态 */
  enabled: boolean;
  /** 文档更新频率（天） */
  updateFrequency: number;
  /** 文档模板路径 */
  templatePath?: string;
  /** 文档输出路径 */
  outputPath?: string;
  /** 文档生成命令 */
  generationCommand?: string;
}

export interface MaintainabilityConfig {
  /** 可维护性配置ID */
  id: string;
  /** 可维护性级别 */
  maintainabilityLevel: MaintainabilityLevel;
  /** 代码质量规则配置 */
  codeQualityRules: CodeQualityRuleConfig[];
  /** 文档配置 */
  documentationConfigs: DocumentationConfig[];
  /** 静态代码分析启用状态 */
  staticCodeAnalysisEnabled: boolean;
  /** 自动测试启用状态 */
  automatedTestingEnabled: boolean;
  /** 持续集成启用状态 */
  continuousIntegrationEnabled: boolean;
  /** 持续部署启用状态 */
  continuousDeploymentEnabled: boolean;
  /** 代码审查启用状态 */
  codeReviewEnabled: boolean;
  /** 技术债务跟踪启用状态 */
  techDebtTrackingEnabled: boolean;
  /** 依赖更新检查启用状态 */
  dependencyUpdateCheckEnabled: boolean;
  /** 依赖更新频率（天） */
  dependencyUpdateFrequency: number;
  /** 代码质量报告生成频率（天） */
  codeQualityReportFrequency: number;
  /** 文档更新提醒启用状态 */
  documentationUpdateReminderEnabled: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 最后应用时间 */
  lastAppliedAt?: Date;
  /** 应用状态 */
  applied: boolean;
}

export interface CodeQualityIssue {
  /** 问题ID */
  id: string;
  /** 问题类型 */
  type: CodeQualityRule;
  /** 问题描述 */
  description: string;
  /** 问题严重程度 */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 问题位置 */
  location: {
    /** 文件路径 */
    filePath: string;
    /** 开始行 */
    startLine: number;
    /** 结束行 */
    endLine: number;
    /** 开始列 */
    startColumn?: number;
    /** 结束列 */
    endColumn?: number;
  };
  /** 问题修复建议 */
  suggestion?: string;
  /** 问题检测时间 */
  detectedAt: Date;
  /** 是否已修复 */
  fixed: boolean;
  /** 修复时间 */
  fixedAt?: Date;
  /** 修复人 */
  fixedBy?: string;
}

export interface CodeQualityReport {
  /** 报告ID */
  id: string;
  /** 报告时间 */
  reportTime: Date;
  /** 报告期间（秒） */
  reportPeriod: number;
  /** 代码质量统计 */
  codeQualityStats: {
    /** 总问题数量 */
    totalIssues: number;
    /** 严重问题数量 */
    criticalIssues: number;
    /** 高问题数量 */
    highIssues: number;
    /** 中问题数量 */
    mediumIssues: number;
    /** 低问题数量 */
    lowIssues: number;
    /** 已修复问题数量 */
    fixedIssues: number;
    /** 未修复问题数量 */
    unfixedIssues: number;
  };
  /** 规则违规统计 */
  ruleViolationStats: {
    /** 规则类型 */
    ruleType: CodeQualityRule;
    /** 违规数量 */
    violationCount: number;
    /** 已修复数量 */
    fixedCount: number;
  }[];
  /** 代码质量得分 */
  codeQualityScore: number;
  /** 技术债务估算（小时） */
  techDebtEstimate: number;
  /** 代码重复率（百分比） */
  codeDuplicationRate: number;
  /** 平均代码复杂度 */
  averageCodeComplexity: number;
  /** 注释覆盖率（百分比） */
  commentCoverage: number;
  /** 测试覆盖率（百分比） */
  testCoverage: number;
  /** 优化建议 */
  recommendations: string[];
}

export interface TechDebtItem {
  /** 技术债务ID */
  id: string;
  /** 技术债务标题 */
  title: string;
  /** 技术债务描述 */
  description: string;
  /** 技术债务严重程度 */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 技术债务类型 */
  type: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
  /** 技术债务估算工作量（小时） */
  estimate: number;
  /** 技术债务创建时间 */
  createdAt: Date;
  /** 技术债务状态 */
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  /** 技术债务解决时间 */
  resolvedAt?: Date;
  /** 技术债务解决人 */
  resolvedBy?: string;
  /** 技术债务关联问题ID列表 */
  relatedIssues?: string[];
  /** 技术债务标签 */
  tags?: string[];
}

export interface DocumentationStatus {
  /** 文档类型 */
  type: DocumentationType;
  /** 文档名称 */
  name: string;
  /** 文档状态 */
  status: 'UP_TO_DATE' | 'OUTDATED' | 'MISSING';
  /** 上次更新时间 */
  lastUpdatedAt?: Date;
  /** 下次更新时间 */
  nextUpdateAt?: Date;
  /** 文档路径 */
  path?: string;
  /** 文档版本 */
  version?: string;
  /** 文档作者 */
  author?: string;
}

export interface MaintainabilityMetric {
  /** 指标ID */
  id: string;
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 指标单位 */
  unit: string;
  /** 时间戳 */
  timestamp: Date;
  /** 指标类型 */
  type: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
  /** 模块名称 */
  moduleName?: string;
}

export interface MaintainabilityEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
  /** 事件时间 */
  timestamp: Date;
  /** 事件详情 */
  details: Record<string, any>;
  /** 事件来源 */
  source: string;
  /** 影响范围 */
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 是否已处理 */
  processed: boolean;
  /** 模块名称 */
  moduleName?: string;
}
