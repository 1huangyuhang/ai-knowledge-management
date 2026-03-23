"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityOptimizationRepositoryImpl = void 0;
class SecurityOptimizationRepositoryImpl {
    configs = new Map();
    scanResults = [];
    auditLogs = [];
    securityEvents = new Map();
    async getCurrentConfig() {
        const sortedConfigs = Array.from(this.configs.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return sortedConfigs[0] || null;
    }
    async saveConfig(config) {
        this.configs.set(config.id, config);
        return config;
    }
    async getAllConfigs() {
        return Array.from(this.configs.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    async getConfigById(id) {
        return this.configs.get(id) || null;
    }
    async deleteConfig(id) {
        return this.configs.delete(id);
    }
    async saveScanResult(scanResult) {
        this.scanResults.push(scanResult);
        return scanResult;
    }
    async getScanHistory(limit, offset) {
        const sortedResults = [...this.scanResults].sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
        return sortedResults.slice(offset, offset + limit);
    }
    async saveAuditLog(auditLog) {
        this.auditLogs.push(auditLog);
        return auditLog;
    }
    async getAuditLogs(startTime, endTime, limit, offset) {
        const filteredLogs = this.auditLogs.filter(log => new Date(log.timestamp) >= startTime && new Date(log.timestamp) <= endTime);
        const sortedLogs = filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedLogs.slice(offset, offset + limit);
    }
    async saveSecurityEvent(event) {
        this.securityEvents.set(event.id, event);
        return event;
    }
    async getSecurityEvents(limit, offset) {
        const sortedEvents = Array.from(this.securityEvents.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedEvents.slice(offset, offset + limit);
    }
    async markEventAsProcessed(eventId) {
        const event = this.securityEvents.get(eventId);
        if (!event) {
            return false;
        }
        event.processed = true;
        this.securityEvents.set(eventId, event);
        return true;
    }
    async getUnprocessedEvents() {
        return Array.from(this.securityEvents.values()).filter(event => !event.processed);
    }
}
exports.SecurityOptimizationRepositoryImpl = SecurityOptimizationRepositoryImpl;
//# sourceMappingURL=SecurityOptimizationRepositoryImpl.js.map