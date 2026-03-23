/**
 * 安全优化仓库接口
 * 定义安全优化相关的数据访问方法
 */

import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent } from '../entities/SecurityConfig';

export interface SecurityOptimizationRepository {
  /**
   * 获取当前安全配置
   * @returns 当前安全配置
   */
  getCurrentConfig(): Promise<SecurityConfig | null>;

  /**
   * 保存安全配置
   * @param config 安全配置
   * @returns 保存后的安全配置
   */
  saveConfig(config: SecurityConfig): Promise<SecurityConfig>;

  /**
   * 获取所有安全配置
   * @returns 安全配置列表
   */
  getAllConfigs(): Promise<SecurityConfig[]>;

  /**
   * 根据ID获取安全配置
   * @param id 安全配置ID
   * @returns 安全配置
   */
  getConfigById(id: string): Promise<SecurityConfig | null>;

  /**
   * 删除安全配置
   * @param id 安全配置ID
   * @returns 删除结果
   */
  deleteConfig(id: string): Promise<boolean>;

  /**
   * 保存安全扫描结果
   * @param scanResult 安全扫描结果
   * @returns 保存后的安全扫描结果
   */
  saveScanResult(scanResult: SecurityScanResult): Promise<SecurityScanResult>;

  /**
   * 获取安全扫描历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全扫描历史列表
   */
  getScanHistory(limit: number, offset: number): Promise<SecurityScanResult[]>;

  /**
   * 保存安全审计日志
   * @param auditLog 安全审计日志
   * @returns 保存后的安全审计日志
   */
  saveAuditLog(auditLog: SecurityAuditLog): Promise<SecurityAuditLog>;

  /**
   * 获取安全审计日志
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全审计日志列表
   */
  getAuditLogs(startTime: Date, endTime: Date, limit: number, offset: number): Promise<SecurityAuditLog[]>;

  /**
   * 保存安全事件
   * @param event 安全事件
   * @returns 保存后的安全事件
   */
  saveSecurityEvent(event: SecurityEvent): Promise<SecurityEvent>;

  /**
   * 获取安全事件列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全事件列表
   */
  getSecurityEvents(limit: number, offset: number): Promise<SecurityEvent[]>;

  /**
   * 标记安全事件为已处理
   * @param eventId 安全事件ID
   * @returns 处理结果
   */
  markEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 获取未处理的安全事件
   * @returns 未处理的安全事件列表
   */
  getUnprocessedEvents(): Promise<SecurityEvent[]>;
}
