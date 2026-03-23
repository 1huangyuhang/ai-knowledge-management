/**
 * 安全优化服务接口
 * 定义安全优化相关的业务逻辑方法
 */

import { SecurityConfig, SecurityAuditLog, SecurityScanResult, SecurityEvent, SecurityLevel } from '../entities/SecurityConfig';

export interface SecurityOptimizationService {
  /**
   * 获取当前安全配置
   * @returns 当前安全配置
   */
  getCurrentSecurityConfig(): Promise<SecurityConfig>;

  /**
   * 更新安全配置
   * @param config 安全配置
   * @returns 更新后的安全配置
   */
  updateSecurityConfig(config: Partial<SecurityConfig>): Promise<SecurityConfig>;

  /**
   * 应用安全配置
   * @param configId 安全配置ID
   * @returns 应用结果
   */
  applySecurityConfig(configId: string): Promise<boolean>;

  /**
   * 执行安全扫描
   * @returns 扫描结果
   */
  runSecurityScan(): Promise<SecurityScanResult>;

  /**
   * 获取安全扫描历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全扫描历史列表
   */
  getSecurityScanHistory(limit: number, offset: number): Promise<SecurityScanResult[]>;

  /**
   * 获取安全审计日志
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 安全审计日志列表
   */
  getSecurityAuditLogs(startTime: Date, endTime: Date, limit: number, offset: number): Promise<SecurityAuditLog[]>;

  /**
   * 记录安全审计日志
   * @param log 安全审计日志
   * @returns 记录结果
   */
  recordSecurityAuditLog(log: SecurityAuditLog): Promise<boolean>;

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
  markSecurityEventAsProcessed(eventId: string): Promise<boolean>;

  /**
   * 生成安全报告
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 安全报告
   */
  generateSecurityReport(startTime: Date, endTime: Date): Promise<any>;

  /**
   * 检查安全合规性
   * @returns 合规性检查结果
   */
  checkSecurityCompliance(): Promise<{ compliant: boolean; issues: string[] }>;

  /**
   * 优化安全配置
   * @param targetLevel 目标安全级别
   * @returns 优化建议和结果
   */
  optimizeSecurityConfig(targetLevel: SecurityLevel): Promise<{ optimizedConfig: SecurityConfig; changes: string[] }>;

  /**
   * 获取安全最佳实践建议
   * @returns 安全最佳实践建议列表
   */
  getSecurityRecommendations(): Promise<string[]>;
}
