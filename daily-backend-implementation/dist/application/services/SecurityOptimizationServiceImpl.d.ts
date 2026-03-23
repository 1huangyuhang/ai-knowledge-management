import { SecurityOptimizationService } from '../../domain/services/SecurityOptimizationService';
import { SecurityOptimizationRepository } from '../../domain/repositories/SecurityOptimizationRepository';
import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent, SecurityLevel } from '../../domain/entities/SecurityConfig';
export declare class SecurityOptimizationServiceImpl implements SecurityOptimizationService {
    private repository;
    constructor(repository: SecurityOptimizationRepository);
    getCurrentSecurityConfig(): Promise<SecurityConfig>;
    updateSecurityConfig(config: Partial<SecurityConfig>): Promise<SecurityConfig>;
    applySecurityConfig(configId: string): Promise<boolean>;
    runSecurityScan(): Promise<SecurityScanResult>;
    getSecurityScanHistory(limit: number, offset: number): Promise<SecurityScanResult[]>;
    getSecurityAuditLogs(startTime: Date, endTime: Date, limit: number, offset: number): Promise<SecurityAuditLog[]>;
    recordSecurityAuditLog(log: SecurityAuditLog): Promise<boolean>;
    getSecurityEvents(limit: number, offset: number): Promise<SecurityEvent[]>;
    markSecurityEventAsProcessed(eventId: string): Promise<boolean>;
    generateSecurityReport(startTime: Date, endTime: Date): Promise<any>;
    checkSecurityCompliance(): Promise<{
        compliant: boolean;
        issues: string[];
    }>;
    optimizeSecurityConfig(targetLevel: SecurityLevel): Promise<{
        optimizedConfig: SecurityConfig;
        changes: string[];
    }>;
    getSecurityRecommendations(): Promise<string[]>;
    private createDefaultSecurityConfig;
    private calculateSecurityScore;
}
//# sourceMappingURL=SecurityOptimizationServiceImpl.d.ts.map