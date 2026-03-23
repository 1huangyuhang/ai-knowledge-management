"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityOptimizationServiceImpl = void 0;
const tslib_1 = require("tslib");
const SecurityConfig_1 = require("../../domain/entities/SecurityConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class SecurityOptimizationServiceImpl {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getCurrentSecurityConfig() {
        let config = await this.repository.getCurrentConfig();
        if (!config) {
            config = this.createDefaultSecurityConfig();
            await this.repository.saveConfig(config);
        }
        return config;
    }
    async updateSecurityConfig(config) {
        const currentConfig = await this.getCurrentSecurityConfig();
        const updatedConfig = {
            ...currentConfig,
            ...config,
            updatedAt: new Date(),
            applied: false
        };
        return this.repository.saveConfig(updatedConfig);
    }
    async applySecurityConfig(configId) {
        const config = await this.repository.getConfigById(configId);
        if (!config) {
            throw new Error(`Security config with ID ${configId} not found`);
        }
        config.lastAppliedAt = new Date();
        config.applied = true;
        await this.repository.saveConfig(config);
        return true;
    }
    async runSecurityScan() {
        const startTime = new Date();
        const scanResult = {
            id: crypto_1.default.randomUUID(),
            scanTime: startTime,
            scanResults: [],
            status: 'COMPLETED',
            duration: 0,
            securityScore: 100
        };
        const mockVulnerabilities = [
            {
                name: '弱密码策略',
                description: '密码长度要求过低，容易被暴力破解',
                severity: 'MEDIUM',
                recommendation: '增加密码最小长度至12位',
                location: '安全配置',
                fixed: false
            },
            {
                name: '缺少HTTPS强制',
                description: '系统允许HTTP访问，存在中间人攻击风险',
                severity: 'HIGH',
                recommendation: '启用HTTPS强制',
                location: '服务器配置',
                fixed: false
            },
            {
                name: 'CORS配置过于宽松',
                description: 'CORS允许所有来源访问，存在跨域安全风险',
                severity: 'LOW',
                recommendation: '限制CORS允许的来源为特定域名',
                location: '服务器配置',
                fixed: false
            }
        ];
        scanResult.scanResults = mockVulnerabilities;
        scanResult.duration = (new Date().getTime() - startTime.getTime()) / 1000;
        scanResult.securityScore = this.calculateSecurityScore(scanResult);
        return this.repository.saveScanResult(scanResult);
    }
    async getSecurityScanHistory(limit, offset) {
        return this.repository.getScanHistory(limit, offset);
    }
    async getSecurityAuditLogs(startTime, endTime, limit, offset) {
        return this.repository.getAuditLogs(startTime, endTime, limit, offset);
    }
    async recordSecurityAuditLog(log) {
        await this.repository.saveAuditLog(log);
        return true;
    }
    async getSecurityEvents(limit, offset) {
        return this.repository.getSecurityEvents(limit, offset);
    }
    async markSecurityEventAsProcessed(eventId) {
        return this.repository.markEventAsProcessed(eventId);
    }
    async generateSecurityReport(startTime, endTime) {
        const scanHistory = await this.repository.getScanHistory(100, 0);
        const recentScans = scanHistory.filter(scan => scan.scanTime >= startTime && scan.scanTime <= endTime);
        const auditLogs = await this.repository.getAuditLogs(startTime, endTime, 1000, 0);
        const securityEvents = await this.repository.getSecurityEvents(100, 0);
        const currentConfig = await this.getCurrentSecurityConfig();
        const criticalVulnerabilities = recentScans
            .flatMap(scan => scan.scanResults)
            .filter(vuln => vuln.severity === 'CRITICAL' && !vuln.fixed).length;
        const highVulnerabilities = recentScans
            .flatMap(scan => scan.scanResults)
            .filter(vuln => vuln.severity === 'HIGH' && !vuln.fixed).length;
        const mediumVulnerabilities = recentScans
            .flatMap(scan => scan.scanResults)
            .filter(vuln => vuln.severity === 'MEDIUM' && !vuln.fixed).length;
        const lowVulnerabilities = recentScans
            .flatMap(scan => scan.scanResults)
            .filter(vuln => vuln.severity === 'LOW' && !vuln.fixed).length;
        return {
            reportTime: new Date(),
            period: {
                startTime,
                endTime
            },
            currentSecurityLevel: currentConfig.securityLevel,
            securityScore: recentScans.length > 0 ? recentScans[0].securityScore : 100,
            vulnerabilities: {
                critical: criticalVulnerabilities,
                high: highVulnerabilities,
                medium: mediumVulnerabilities,
                low: lowVulnerabilities
            },
            securityEvents: securityEvents.length,
            auditLogs: auditLogs.length,
            recentScans: recentScans.slice(0, 5)
        };
    }
    async checkSecurityCompliance() {
        const currentConfig = await this.getCurrentSecurityConfig();
        const issues = [];
        if (!currentConfig.enforceHttps) {
            issues.push('未启用HTTPS强制，存在中间人攻击风险');
        }
        if (!currentConfig.secureCookies) {
            issues.push('未启用安全cookie，存在cookie劫持风险');
        }
        if (!currentConfig.contentSecurityPolicy) {
            issues.push('未启用内容安全策略，存在XSS攻击风险');
        }
        if (currentConfig.passwordPolicy.minLength < 8) {
            issues.push('密码最小长度不足，建议至少8位');
        }
        if (!currentConfig.passwordPolicy.requireUppercase) {
            issues.push('密码策略未要求大写字母');
        }
        if (!currentConfig.passwordPolicy.requireLowercase) {
            issues.push('密码策略未要求小写字母');
        }
        if (!currentConfig.passwordPolicy.requireDigits) {
            issues.push('密码策略未要求数字');
        }
        if (!currentConfig.rateLimit.enabled) {
            issues.push('未启用速率限制，存在DDoS攻击风险');
        }
        return {
            compliant: issues.length === 0,
            issues
        };
    }
    async optimizeSecurityConfig(targetLevel) {
        const currentConfig = await this.getCurrentSecurityConfig();
        const changes = [];
        const optimizedConfig = { ...currentConfig };
        switch (targetLevel) {
            case SecurityConfig_1.SecurityLevel.CRITICAL:
                changes.push('设置安全级别为极高');
                optimizedConfig.securityLevel = SecurityConfig_1.SecurityLevel.CRITICAL;
                optimizedConfig.encryptionAlgorithm = 'AES-256';
                changes.push('使用AES-256加密算法');
                optimizedConfig.passwordPolicy.minLength = 16;
                changes.push('密码最小长度设置为16位');
                optimizedConfig.rateLimit.limit = 10;
                changes.push('速率限制设置为10次/窗口');
                optimizedConfig.enforceHttps = true;
                changes.push('启用HTTPS强制');
                optimizedConfig.secureCookies = true;
                changes.push('启用安全cookie');
                optimizedConfig.contentSecurityPolicy = true;
                changes.push('启用内容安全策略');
                break;
            case SecurityConfig_1.SecurityLevel.HIGH:
                changes.push('设置安全级别为高');
                optimizedConfig.securityLevel = SecurityConfig_1.SecurityLevel.HIGH;
                optimizedConfig.encryptionAlgorithm = 'AES-256';
                changes.push('使用AES-256加密算法');
                optimizedConfig.passwordPolicy.minLength = 12;
                changes.push('密码最小长度设置为12位');
                optimizedConfig.rateLimit.limit = 20;
                changes.push('速率限制设置为20次/窗口');
                optimizedConfig.enforceHttps = true;
                changes.push('启用HTTPS强制');
                optimizedConfig.secureCookies = true;
                changes.push('启用安全cookie');
                optimizedConfig.contentSecurityPolicy = true;
                changes.push('启用内容安全策略');
                break;
            case SecurityConfig_1.SecurityLevel.MEDIUM:
                changes.push('设置安全级别为中');
                optimizedConfig.securityLevel = SecurityConfig_1.SecurityLevel.MEDIUM;
                optimizedConfig.encryptionAlgorithm = 'AES-256';
                changes.push('使用AES-256加密算法');
                optimizedConfig.passwordPolicy.minLength = 10;
                changes.push('密码最小长度设置为10位');
                optimizedConfig.rateLimit.limit = 50;
                changes.push('速率限制设置为50次/窗口');
                optimizedConfig.enforceHttps = true;
                changes.push('启用HTTPS强制');
                optimizedConfig.secureCookies = true;
                changes.push('启用安全cookie');
                break;
            case SecurityConfig_1.SecurityLevel.LOW:
                changes.push('设置安全级别为低');
                optimizedConfig.securityLevel = SecurityConfig_1.SecurityLevel.LOW;
                optimizedConfig.encryptionAlgorithm = 'AES-256';
                changes.push('使用AES-256加密算法');
                optimizedConfig.passwordPolicy.minLength = 8;
                changes.push('密码最小长度设置为8位');
                optimizedConfig.rateLimit.limit = 100;
                changes.push('速率限制设置为100次/窗口');
                break;
        }
        optimizedConfig.updatedAt = new Date();
        optimizedConfig.applied = false;
        const savedConfig = await this.repository.saveConfig(optimizedConfig);
        return {
            optimizedConfig: savedConfig,
            changes
        };
    }
    async getSecurityRecommendations() {
        const currentConfig = await this.getCurrentSecurityConfig();
        const recommendations = [];
        if (!currentConfig.enforceHttps) {
            recommendations.push('建议启用HTTPS强制，防止中间人攻击');
        }
        if (!currentConfig.secureCookies) {
            recommendations.push('建议启用安全cookie，防止cookie劫持');
        }
        if (!currentConfig.contentSecurityPolicy) {
            recommendations.push('建议启用内容安全策略，防止XSS攻击');
        }
        if (currentConfig.passwordPolicy.minLength < 12) {
            recommendations.push('建议将密码最小长度增加到12位，提高安全性');
        }
        if (!currentConfig.rateLimit.enabled) {
            recommendations.push('建议启用速率限制，防止DDoS攻击');
        }
        if (currentConfig.securityAuditConfig.enabled) {
            recommendations.push('建议定期查看安全审计日志，及时发现异常行为');
        }
        else {
            recommendations.push('建议启用安全审计日志，便于安全事件追溯');
        }
        recommendations.push('建议定期执行安全扫描，及时发现和修复漏洞');
        recommendations.push('建议使用多因素认证，提高账户安全性');
        recommendations.push('建议定期更新系统依赖，修复已知漏洞');
        return recommendations;
    }
    createDefaultSecurityConfig() {
        return {
            id: crypto_1.default.randomUUID(),
            securityLevel: SecurityConfig_1.SecurityLevel.MEDIUM,
            authMethods: ['TOKEN', 'PASSWORD'],
            encryptionAlgorithm: 'AES-256',
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireDigits: true,
                requireSpecialChars: false,
                expiryDays: 90,
                historyLength: 5
            },
            rateLimit: {
                window: 60,
                limit: 50,
                enabled: true
            },
            cors: {
                origins: ['*'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                headers: ['*'],
                credentials: true,
                enabled: true
            },
            audit: {
                enabled: true,
                retentionDays: 30,
                logLevel: 'INFO'
            },
            xssProtection: {
                enabled: true,
                strictMode: true
            },
            csrfProtection: {
                enabled: true,
                tokenExpiry: 3600
            },
            loginAttemptLimit: {
                maxAttempts: 5,
                lockoutTime: 30,
                enabled: true
            },
            enforceHttps: false,
            secureCookies: false,
            contentSecurityPolicy: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            applied: true
        };
    }
    calculateSecurityScore(scanResult) {
        let totalScore = 100;
        const severityWeights = {
            CRITICAL: 20,
            HIGH: 15,
            MEDIUM: 10,
            LOW: 5
        };
        for (const vuln of scanResult.scanResults) {
            if (!vuln.fixed) {
                totalScore -= severityWeights[vuln.severity];
            }
        }
        return Math.max(0, Math.min(100, totalScore));
    }
}
exports.SecurityOptimizationServiceImpl = SecurityOptimizationServiceImpl;
//# sourceMappingURL=SecurityOptimizationServiceImpl.js.map