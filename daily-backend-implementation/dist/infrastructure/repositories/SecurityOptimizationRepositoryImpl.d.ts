import { SecurityOptimizationRepository } from '../../domain/repositories/SecurityOptimizationRepository';
import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent } from '../../domain/entities/SecurityConfig';
export declare class SecurityOptimizationRepositoryImpl implements SecurityOptimizationRepository {
    private configs;
    private scanResults;
    private auditLogs;
    private securityEvents;
    getCurrentConfig(): Promise<SecurityConfig | null>;
    saveConfig(config: SecurityConfig): Promise<SecurityConfig>;
    getAllConfigs(): Promise<SecurityConfig[]>;
    getConfigById(id: string): Promise<SecurityConfig | null>;
    deleteConfig(id: string): Promise<boolean>;
    saveScanResult(scanResult: SecurityScanResult): Promise<SecurityScanResult>;
    getScanHistory(limit: number, offset: number): Promise<SecurityScanResult[]>;
    saveAuditLog(auditLog: SecurityAuditLog): Promise<SecurityAuditLog>;
    getAuditLogs(startTime: Date, endTime: Date, limit: number, offset: number): Promise<SecurityAuditLog[]>;
    saveSecurityEvent(event: SecurityEvent): Promise<SecurityEvent>;
    getSecurityEvents(limit: number, offset: number): Promise<SecurityEvent[]>;
    markEventAsProcessed(eventId: string): Promise<boolean>;
    getUnprocessedEvents(): Promise<SecurityEvent[]>;
}
//# sourceMappingURL=SecurityOptimizationRepositoryImpl.d.ts.map