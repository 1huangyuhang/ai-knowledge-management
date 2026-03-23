/**
 * 安全优化仓库实现
 * 使用内存存储来保存安全配置、扫描结果、审计日志和安全事件
 */

import { SecurityOptimizationRepository } from '../../domain/repositories/SecurityOptimizationRepository';
import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent } from '../../domain/entities/SecurityConfig';

/**
 * 安全优化仓库实现类
 */
export class SecurityOptimizationRepositoryImpl implements SecurityOptimizationRepository {
  private configs: Map<string, SecurityConfig> = new Map();
  private scanResults: SecurityScanResult[] = [];
  private auditLogs: SecurityAuditLog[] = [];
  private securityEvents: Map<string, SecurityEvent> = new Map();

  /**
   * 获取当前安全配置
   * @returns 当前安全配置
   */
  async getCurrentConfig(): Promise<SecurityConfig | null> {
    // 返回最新的安全配置
    const sortedConfigs = Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sortedConfigs[0] || null;
  }

  /**
   * 保存安全配置
   * @param config 安全配置
   * @returns 保存后的安全配置
   */
  async saveConfig(config: SecurityConfig): Promise<SecurityConfig> {
    this.configs.set(config.id, config);
    return config;
  }

  /**
   * 获取所有安全配置
   * @returns 安全配置列表
   */
  async getAllConfigs(): Promise<SecurityConfig[]> {
    return Array.from(this.configs.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * 根据ID获取安全配置
   * @param id 安全配置ID
   * @returns 安全配置
   */
  async getConfigById(id: string): Promise<SecurityConfig | null> {
    return this.configs.get(id) || null;
  }

  /**
   * 删除安全配置
   * @param id 安全配置ID
   * @returns 删除结果
   */
  async deleteConfig(id: string): Promise<boolean> {
    return this.configs.delete(id);
  }

  /**
   * 保存安全扫描结果
   * @param scanResult 安全扫描结果
   * @returns 保存后的安全扫描结果
   */
  async saveScanResult(scanResult: SecurityScanResult): Promise<SecurityScanResult> {
    this.scanResults.push(scanResult);
    return scanResult;
  }

  /**
   * 获取安全扫描历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全扫描历史列表
   */
  async getScanHistory(limit: number, offset: number): Promise<SecurityScanResult[]> {
    const sortedResults = [...this.scanResults].sort(
      (a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime()
    );
    return sortedResults.slice(offset, offset + limit);
  }

  /**
   * 保存安全审计日志
   * @param auditLog 安全审计日志
   * @returns 保存后的安全审计日志
   */
  async saveAuditLog(auditLog: SecurityAuditLog): Promise<SecurityAuditLog> {
    this.auditLogs.push(auditLog);
    return auditLog;
  }

  /**
   * 获取安全审计日志
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全审计日志列表
   */
  async getAuditLogs(startTime: Date, endTime: Date, limit: number, offset: number): Promise<SecurityAuditLog[]> {
    const filteredLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) >= startTime && new Date(log.timestamp) <= endTime
    );
    const sortedLogs = filteredLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedLogs.slice(offset, offset + limit);
  }

  /**
   * 保存安全事件
   * @param event 安全事件
   * @returns 保存后的安全事件
   */
  async saveSecurityEvent(event: SecurityEvent): Promise<SecurityEvent> {
    this.securityEvents.set(event.id, event);
    return event;
  }

  /**
   * 获取安全事件列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全事件列表
   */
  async getSecurityEvents(limit: number, offset: number): Promise<SecurityEvent[]> {
    const sortedEvents = Array.from(this.securityEvents.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedEvents.slice(offset, offset + limit);
  }

  /**
   * 标记安全事件为已处理
   * @param eventId 安全事件ID
   * @returns 处理结果
   */
  async markEventAsProcessed(eventId: string): Promise<boolean> {
    const event = this.securityEvents.get(eventId);
    if (!event) {
      return false;
    }
    event.processed = true;
    this.securityEvents.set(eventId, event);
    return true;
  }

  /**
   * 获取未处理的安全事件
   * @returns 未处理的安全事件列表
   */
  async getUnprocessedEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter(event => !event.processed);
  }
}
