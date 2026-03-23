import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent, SecurityLevel } from '../entities/SecurityConfig';
export interface SecurityOptimizationService {
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
}
//# sourceMappingURL=SecurityOptimizationService.d.ts.map