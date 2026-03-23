export declare enum MaintainabilityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum CodeQualityRule {
    CODE_COMPLEXITY = "CODE_COMPLEXITY",
    CODE_DUPLICATION = "CODE_DUPLICATION",
    CODE_LINES = "CODE_LINES",
    COMMENT_COVERAGE = "COMMENT_COVERAGE",
    NAMING_CONVENTION = "NAMING_CONVENTION",
    DEPENDENCY_MANAGEMENT = "DEPENDENCY_MANAGEMENT",
    ERROR_HANDLING = "ERROR_HANDLING",
    LOGGING = "LOGGING",
    TEST_COVERAGE = "TEST_COVERAGE",
    ARCHITECTURE_COMPLIANCE = "ARCHITECTURE_COMPLIANCE"
}
export declare enum DocumentationType {
    API = "API",
    ARCHITECTURE = "ARCHITECTURE",
    DESIGN = "DESIGN",
    DEPLOYMENT = "DEPLOYMENT",
    OPERATION = "OPERATION",
    TEST = "TEST",
    TROUBLESHOOTING = "TROUBLESHOOTING",
    CHANGELOG = "CHANGELOG"
}
export interface CodeQualityRuleConfig {
    ruleType: CodeQualityRule;
    enabled: boolean;
    threshold: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description?: string;
    config?: Record<string, any>;
}
export interface DocumentationConfig {
    type: DocumentationType;
    enabled: boolean;
    updateFrequency: number;
    templatePath?: string;
    outputPath?: string;
    generationCommand?: string;
}
export interface MaintainabilityConfig {
    id: string;
    maintainabilityLevel: MaintainabilityLevel;
    codeQualityRules: CodeQualityRuleConfig[];
    documentationConfigs: DocumentationConfig[];
    staticCodeAnalysisEnabled: boolean;
    automatedTestingEnabled: boolean;
    continuousIntegrationEnabled: boolean;
    continuousDeploymentEnabled: boolean;
    codeReviewEnabled: boolean;
    techDebtTrackingEnabled: boolean;
    dependencyUpdateCheckEnabled: boolean;
    dependencyUpdateFrequency: number;
    codeQualityReportFrequency: number;
    documentationUpdateReminderEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAppliedAt?: Date;
    applied: boolean;
}
export interface CodeQualityIssue {
    id: string;
    type: CodeQualityRule;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: {
        filePath: string;
        startLine: number;
        endLine: number;
        startColumn?: number;
        endColumn?: number;
    };
    suggestion?: string;
    detectedAt: Date;
    fixed: boolean;
    fixedAt?: Date;
    fixedBy?: string;
}
export interface CodeQualityReport {
    id: string;
    reportTime: Date;
    reportPeriod: number;
    codeQualityStats: {
        totalIssues: number;
        criticalIssues: number;
        highIssues: number;
        mediumIssues: number;
        lowIssues: number;
        fixedIssues: number;
        unfixedIssues: number;
    };
    ruleViolationStats: {
        ruleType: CodeQualityRule;
        violationCount: number;
        fixedCount: number;
    }[];
    codeQualityScore: number;
    techDebtEstimate: number;
    codeDuplicationRate: number;
    averageCodeComplexity: number;
    commentCoverage: number;
    testCoverage: number;
    recommendations: string[];
}
export interface TechDebtItem {
    id: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'CODE' | 'ARCHITECTURE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATION';
    estimate: number;
    createdAt: Date;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
    resolvedAt?: Date;
    resolvedBy?: string;
    relatedIssues?: string[];
    tags?: string[];
}
export interface DocumentationStatus {
    type: DocumentationType;
    name: string;
    status: 'UP_TO_DATE' | 'OUTDATED' | 'MISSING';
    lastUpdatedAt?: Date;
    nextUpdateAt?: Date;
    path?: string;
    version?: string;
    author?: string;
}
export interface MaintainabilityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    type: 'CODE_QUALITY' | 'DOCUMENTATION' | 'TECH_DEBT' | 'TEST_COVERAGE' | 'BUILD_TIME' | 'DEPENDENCY_AGE';
    moduleName?: string;
}
export interface MaintainabilityEvent {
    id: string;
    type: 'CODE_QUALITY_SCAN' | 'DOCUMENTATION_UPDATE' | 'TECH_DEBT_ADDED' | 'TECH_DEBT_RESOLVED' | 'DEPENDENCY_UPDATED' | 'BUILD_SUCCESS' | 'BUILD_FAILURE' | 'TEST_RUN' | 'TEST_FAILURE';
    timestamp: Date;
    details: Record<string, any>;
    source: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    processed: boolean;
    moduleName?: string;
}
//# sourceMappingURL=MaintainabilityConfig.d.ts.map