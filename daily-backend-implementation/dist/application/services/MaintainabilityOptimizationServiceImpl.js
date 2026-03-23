"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintainabilityOptimizationServiceImpl = void 0;
const tslib_1 = require("tslib");
const MaintainabilityConfig_1 = require("../../domain/entities/MaintainabilityConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class MaintainabilityOptimizationServiceImpl {
    maintainabilityRepository;
    constructor(maintainabilityRepository) {
        this.maintainabilityRepository = maintainabilityRepository;
    }
    async getMaintainabilityConfig() {
        try {
            return await this.maintainabilityRepository.getMaintainabilityConfig();
        }
        catch (error) {
            console.error('Error getting maintainability config:', error);
            const defaultConfig = {
                id: crypto_1.default.randomUUID(),
                maintainabilityLevel: MaintainabilityConfig_1.MaintainabilityLevel.MEDIUM,
                codeQualityRules: [
                    {
                        ruleType: MaintainabilityConfig_1.CodeQualityRule.CODE_COMPLEXITY,
                        enabled: true,
                        threshold: 10,
                        severity: 'HIGH',
                        description: '代码复杂度不应超过10',
                        config: { maxComplexity: 10 }
                    },
                    {
                        ruleType: MaintainabilityConfig_1.CodeQualityRule.COMMENT_COVERAGE,
                        enabled: true,
                        threshold: 30,
                        severity: 'MEDIUM',
                        description: '注释覆盖率不应低于30%',
                        config: { minCoverage: 30 }
                    },
                    {
                        ruleType: MaintainabilityConfig_1.CodeQualityRule.TEST_COVERAGE,
                        enabled: true,
                        threshold: 80,
                        severity: 'HIGH',
                        description: '测试覆盖率不应低于80%',
                        config: { minCoverage: 80 }
                    }
                ],
                documentationConfigs: [
                    {
                        type: MaintainabilityConfig_1.DocumentationType.API,
                        enabled: true,
                        updateFrequency: 7,
                        generationCommand: 'npm run docs:api'
                    },
                    {
                        type: MaintainabilityConfig_1.DocumentationType.ARCHITECTURE,
                        enabled: true,
                        updateFrequency: 30
                    }
                ],
                staticCodeAnalysisEnabled: true,
                automatedTestingEnabled: true,
                continuousIntegrationEnabled: true,
                continuousDeploymentEnabled: false,
                codeReviewEnabled: true,
                techDebtTrackingEnabled: true,
                dependencyUpdateCheckEnabled: true,
                dependencyUpdateFrequency: 7,
                codeQualityReportFrequency: 1,
                documentationUpdateReminderEnabled: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                applied: false
            };
            return await this.maintainabilityRepository.saveMaintainabilityConfig(defaultConfig);
        }
    }
    async updateMaintainabilityConfig(config) {
        const updatedConfig = {
            ...config,
            updatedAt: new Date()
        };
        return await this.maintainabilityRepository.saveMaintainabilityConfig(updatedConfig);
    }
    async applyMaintainabilityConfig(configId) {
        try {
            const config = await this.maintainabilityRepository.getMaintainabilityConfig();
            if (config.id !== configId) {
                return false;
            }
            const updatedConfig = {
                ...config,
                applied: true,
                lastAppliedAt: new Date(),
                updatedAt: new Date()
            };
            await this.maintainabilityRepository.saveMaintainabilityConfig(updatedConfig);
            return true;
        }
        catch (error) {
            console.error('Error applying maintainability config:', error);
            return false;
        }
    }
    async runStaticCodeAnalysis(moduleName) {
        const report = {
            id: crypto_1.default.randomUUID(),
            reportTime: new Date(),
            reportPeriod: 86400,
            codeQualityStats: {
                totalIssues: 15,
                criticalIssues: 2,
                highIssues: 3,
                mediumIssues: 5,
                lowIssues: 5,
                fixedIssues: 10,
                unfixedIssues: 5
            },
            ruleViolationStats: [
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.CODE_COMPLEXITY,
                    violationCount: 3,
                    fixedCount: 2
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.COMMENT_COVERAGE,
                    violationCount: 4,
                    fixedCount: 3
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.TEST_COVERAGE,
                    violationCount: 2,
                    fixedCount: 1
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.CODE_DUPLICATION,
                    violationCount: 3,
                    fixedCount: 2
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.ERROR_HANDLING,
                    violationCount: 3,
                    fixedCount: 2
                }
            ],
            codeQualityScore: 85,
            techDebtEstimate: 24,
            codeDuplicationRate: 5.2,
            averageCodeComplexity: 8.5,
            commentCoverage: 35,
            testCoverage: 82,
            recommendations: [
                '降低核心模块的代码复杂度',
                '提高新代码的注释覆盖率',
                '修复关键路径上的错误处理问题',
                '减少重复代码，提取公共函数'
            ]
        };
        await this.maintainabilityRepository.saveCodeQualityReport(report);
        await this.maintainabilityRepository.saveMaintainabilityEvent({
            id: crypto_1.default.randomUUID(),
            type: 'CODE_QUALITY_SCAN',
            timestamp: new Date(),
            details: {
                reportId: report.id,
                moduleName,
                issuesFound: report.codeQualityStats.totalIssues
            },
            source: 'MaintainabilityOptimizationService',
            impact: 'MEDIUM',
            processed: false,
            moduleName
        });
        return report;
    }
    async getCodeQualityIssues(filters) {
        return await this.maintainabilityRepository.getCodeQualityIssues(filters);
    }
    async fixCodeQualityIssue(issueId, fixedBy) {
        try {
            const issues = await this.maintainabilityRepository.getCodeQualityIssues();
            const issue = issues.find(issue => issue.id === issueId);
            if (!issue) {
                return false;
            }
            const updatedIssue = {
                ...issue,
                fixed: true,
                fixedAt: new Date(),
                fixedBy
            };
            await this.maintainabilityRepository.updateCodeQualityIssue(updatedIssue);
            return true;
        }
        catch (error) {
            console.error('Error fixing code quality issue:', error);
            return false;
        }
    }
    async getCodeQualityReportHistory(limit, moduleName) {
        return await this.maintainabilityRepository.getCodeQualityReports(limit, moduleName);
    }
    async addTechDebt(techDebt) {
        const newTechDebt = {
            id: crypto_1.default.randomUUID(),
            ...techDebt,
            createdAt: new Date()
        };
        const savedTechDebt = await this.maintainabilityRepository.saveTechDebt(newTechDebt);
        await this.maintainabilityRepository.saveMaintainabilityEvent({
            id: crypto_1.default.randomUUID(),
            type: 'TECH_DEBT_ADDED',
            timestamp: new Date(),
            details: {
                techDebtId: savedTechDebt.id,
                title: savedTechDebt.title,
                severity: savedTechDebt.severity,
                estimate: savedTechDebt.estimate
            },
            source: 'MaintainabilityOptimizationService',
            impact: savedTechDebt.severity,
            processed: false
        });
        return savedTechDebt;
    }
    async getTechDebtItems(filters) {
        return await this.maintainabilityRepository.getTechDebtItems(filters);
    }
    async updateTechDebtStatus(techDebtId, status, resolvedBy) {
        const techDebts = await this.maintainabilityRepository.getTechDebtItems();
        const techDebt = techDebts.find(item => item.id === techDebtId);
        if (!techDebt) {
            throw new Error(`Tech debt with id ${techDebtId} not found`);
        }
        const updatedTechDebt = {
            ...techDebt,
            status,
            resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
            resolvedBy: status === 'RESOLVED' ? resolvedBy : undefined
        };
        const savedTechDebt = await this.maintainabilityRepository.updateTechDebt(updatedTechDebt);
        if (status === 'RESOLVED') {
            await this.maintainabilityRepository.saveMaintainabilityEvent({
                id: crypto_1.default.randomUUID(),
                type: 'TECH_DEBT_RESOLVED',
                timestamp: new Date(),
                details: {
                    techDebtId: savedTechDebt.id,
                    title: savedTechDebt.title,
                    resolvedBy
                },
                source: 'MaintainabilityOptimizationService',
                impact: savedTechDebt.severity,
                processed: false
            });
        }
        return savedTechDebt;
    }
    async getDocumentationStatus() {
        return await this.maintainabilityRepository.getDocumentationStatuses();
    }
    async updateDocumentationStatus(documentationStatus) {
        const savedStatus = await this.maintainabilityRepository.saveDocumentationStatus(documentationStatus);
        await this.maintainabilityRepository.saveMaintainabilityEvent({
            id: crypto_1.default.randomUUID(),
            type: 'DOCUMENTATION_UPDATE',
            timestamp: new Date(),
            details: {
                documentationType: savedStatus.type,
                status: savedStatus.status,
                name: savedStatus.name
            },
            source: 'MaintainabilityOptimizationService',
            impact: 'LOW',
            processed: false
        });
        return savedStatus;
    }
    async checkDependencyUpdates() {
        const updates = [
            {
                name: 'express',
                current: '4.18.2',
                latest: '4.19.2',
                type: 'dependency',
                severity: 'LOW'
            },
            {
                name: 'typescript',
                current: '5.2.2',
                latest: '5.4.5',
                type: 'devDependency',
                severity: 'MEDIUM'
            },
            {
                name: 'fastify',
                current: '4.26.1',
                latest: '4.28.1',
                type: 'dependency',
                severity: 'LOW'
            },
            {
                name: 'jest',
                current: '29.7.0',
                latest: '30.0.0',
                type: 'devDependency',
                severity: 'HIGH'
            }
        ];
        await this.maintainabilityRepository.saveMaintainabilityEvent({
            id: crypto_1.default.randomUUID(),
            type: 'DEPENDENCY_UPDATED',
            timestamp: new Date(),
            details: {
                updatesAvailable: updates.length,
                updates
            },
            source: 'MaintainabilityOptimizationService',
            impact: 'MEDIUM',
            processed: false
        });
        return updates;
    }
    async getMaintainabilityMetrics(filters) {
        return await this.maintainabilityRepository.getMaintainabilityMetrics(filters);
    }
    async recordMaintainabilityEvent(event) {
        const newEvent = {
            id: crypto_1.default.randomUUID(),
            ...event,
            timestamp: new Date(),
            processed: false
        };
        return await this.maintainabilityRepository.saveMaintainabilityEvent(newEvent);
    }
    async getMaintainabilityEvents(filters) {
        return await this.maintainabilityRepository.getMaintainabilityEvents(filters);
    }
    async markEventAsProcessed(eventId) {
        try {
            const events = await this.maintainabilityRepository.getMaintainabilityEvents();
            const event = events.find(event => event.id === eventId);
            if (!event) {
                return false;
            }
            const updatedEvent = {
                ...event,
                processed: true
            };
            await this.maintainabilityRepository.updateMaintainabilityEvent(updatedEvent);
            return true;
        }
        catch (error) {
            console.error('Error marking event as processed:', error);
            return false;
        }
    }
    async generateMaintainabilityReport(period) {
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - period);
        const reports = await this.maintainabilityRepository.getCodeQualityReports();
        const techDebts = await this.maintainabilityRepository.getTechDebtItems();
        const metrics = await this.maintainabilityRepository.getMaintainabilityMetrics({
            startTime,
            endTime
        });
        const events = await this.maintainabilityRepository.getMaintainabilityEvents({
            startTime,
            endTime
        });
        const openTechDebts = techDebts.filter(td => td.status === 'OPEN');
        const resolvedTechDebts = techDebts.filter(td => td.status === 'RESOLVED');
        const totalTechDebtHours = openTechDebts.reduce((sum, td) => sum + td.estimate, 0);
        return {
            reportId: crypto_1.default.randomUUID(),
            reportPeriod: {
                startTime,
                endTime,
                days: period
            },
            summary: {
                totalCodeQualityReports: reports.length,
                averageCodeQualityScore: reports.length > 0
                    ? reports.reduce((sum, report) => sum + report.codeQualityScore, 0) / reports.length
                    : 0,
                totalTechDebts: techDebts.length,
                openTechDebts: openTechDebts.length,
                resolvedTechDebts: resolvedTechDebts.length,
                totalTechDebtHours,
                maintainabilityEvents: events.length
            },
            trends: {
                codeQualityScore: metrics
                    .filter(m => m.type === 'CODE_QUALITY')
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                    .map(m => ({ timestamp: m.timestamp, value: m.value })),
                testCoverage: metrics
                    .filter(m => m.type === 'TEST_COVERAGE')
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                    .map(m => ({ timestamp: m.timestamp, value: m.value }))
            },
            recommendations: [
                `解决高优先级技术债务，预计需要${totalTechDebtHours}小时`,
                '定期运行静态代码分析，保持代码质量',
                '确保文档及时更新，提高团队协作效率',
                '监控依赖更新，及时修复安全漏洞'
            ],
            generatedAt: new Date()
        };
    }
    async getTechDebtEstimate() {
        const techDebts = await this.maintainabilityRepository.getTechDebtItems();
        const openTechDebts = techDebts.filter(td => td.status === 'OPEN');
        const totalHours = openTechDebts.reduce((sum, td) => sum + td.estimate, 0);
        const breakdown = openTechDebts.reduce((acc, td) => {
            acc[td.type] = (acc[td.type] || 0) + td.estimate;
            return acc;
        }, {});
        return {
            totalHours,
            breakdown
        };
    }
    async optimizeCodeQualityRules() {
        return {
            optimizedRules: [
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.CODE_COMPLEXITY,
                    currentThreshold: 10,
                    recommendedThreshold: 8,
                    reason: '降低核心业务逻辑的复杂度，提高可维护性'
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.COMMENT_COVERAGE,
                    currentThreshold: 30,
                    recommendedThreshold: 40,
                    reason: '提高注释覆盖率，便于新团队成员理解代码'
                },
                {
                    ruleType: MaintainabilityConfig_1.CodeQualityRule.TEST_COVERAGE,
                    currentThreshold: 80,
                    recommendedThreshold: 85,
                    reason: '提高测试覆盖率，减少生产环境bug'
                }
            ],
            implementationSteps: [
                '更新ESLint配置文件',
                '运行一次完整的静态代码分析',
                '修复发现的高优先级问题',
                '更新CI/CD流程以使用新规则'
            ],
            expectedBenefits: [
                '降低代码维护成本',
                '减少bug数量',
                '提高开发效率',
                '便于团队协作'
            ]
        };
    }
    async checkArchitectureCompliance() {
        return {
            complianceScore: 90,
            checkedComponents: [
                {
                    component: 'Domain Layer',
                    status: 'COMPLIANT',
                    issues: []
                },
                {
                    component: 'Application Layer',
                    status: 'COMPLIANT',
                    issues: []
                },
                {
                    component: 'Infrastructure Layer',
                    status: 'PARTIALLY_COMPLIANT',
                    issues: [
                        '某些服务直接访问数据库，违反了依赖规则',
                        '部分配置项硬编码在代码中'
                    ]
                },
                {
                    component: 'Presentation Layer',
                    status: 'COMPLIANT',
                    issues: []
                }
            ],
            recommendations: [
                '重构基础设施层，确保所有数据库访问通过仓库接口',
                '将硬编码的配置项移至配置文件',
                '添加架构合规性检查到CI/CD流程'
            ]
        };
    }
}
exports.MaintainabilityOptimizationServiceImpl = MaintainabilityOptimizationServiceImpl;
//# sourceMappingURL=MaintainabilityOptimizationServiceImpl.js.map