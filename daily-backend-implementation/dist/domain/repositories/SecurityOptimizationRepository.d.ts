import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent } from '../entities/SecurityConfig';
export interface SecurityOptimizationRepository {
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
//# sourceMappingURL=SecurityOptimizationRepository.d.ts.map