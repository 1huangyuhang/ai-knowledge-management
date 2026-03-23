/**
 * 安全配置实体
 * 表示系统的安全配置和策略
 */

export enum SecurityLevel {
  /** 低安全级别 */
  LOW = 'LOW',
  /** 中安全级别 */
  MEDIUM = 'MEDIUM',
  /** 高安全级别 */
  HIGH = 'HIGH',
  /** 极高安全级别 */
  CRITICAL = 'CRITICAL'
}

export enum EncryptionAlgorithm {
  /** AES-256加密算法 */
  AES_256 = 'AES-256',
  /** RSA-2048加密算法 */
  RSA_2048 = 'RSA-2048',
  /** RSA-4096加密算法 */
  RSA_4096 = 'RSA-4096',
  /** SHA-256哈希算法 */
  SHA_256 = 'SHA-256',
  /** SHA-512哈希算法 */
  SHA_512 = 'SHA-512'
}

export enum AuthMethod {
  /** 基于令牌的认证 */
  TOKEN = 'TOKEN',
  /** 基于密码的认证 */
  PASSWORD = 'PASSWORD',
  /** 多因素认证 */
  MFA = 'MFA',
  /** 基于API密钥的认证 */
  API_KEY = 'API_KEY'
}

export interface RateLimitConfig {
  /** 时间窗口（秒） */
  window: number;
  /** 允许的请求数 */
  limit: number;
  /** 是否启用 */
  enabled: boolean;
}

export interface CORSConfig {
  /** 允许的来源 */
  origins: string[];
  /** 允许的方法 */
  methods: string[];
  /** 允许的头部 */
  headers: string[];
  /** 是否允许凭证 */
  credentials: boolean;
  /** 是否启用 */
  enabled: boolean;
}

export interface SecurityAuditConfig {
  /** 是否启用审计日志 */
  enabled: boolean;
  /** 审计日志保留天数 */
  retentionDays: number;
  /** 审计日志级别 */
  logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}

export interface XSSProtectionConfig {
  /** 是否启用XSS保护 */
  enabled: boolean;
  /** 是否启用严格模式 */
  strictMode: boolean;
}

export interface CSRFProtectionConfig {
  /** 是否启用CSRF保护 */
  enabled: boolean;
  /** CSRF令牌有效期（秒） */
  tokenExpiry: number;
}

export interface SecurityConfig {
  /** 安全配置ID */
  id: string;
  /** 安全级别 */
  securityLevel: SecurityLevel;
  /** 认证方法 */
  authMethods: AuthMethod[];
  /** 加密算法 */
  encryptionAlgorithm: EncryptionAlgorithm;
  /** 密码策略 */
  passwordPolicy: {
    /** 最小长度 */
    minLength: number;
    /** 是否要求大写字母 */
    requireUppercase: boolean;
    /** 是否要求小写字母 */
    requireLowercase: boolean;
    /** 是否要求数字 */
    requireDigits: boolean;
    /** 是否要求特殊字符 */
    requireSpecialChars: boolean;
    /** 密码过期天数 */
    expiryDays: number;
    /** 密码历史记录长度 */
    historyLength: number;
  };
  /** 速率限制配置 */
  rateLimit: RateLimitConfig;
  /** CORS配置 */
  cors: CORSConfig;
  /** 安全审计配置 */
  audit: SecurityAuditConfig;
  /** XSS保护配置 */
  xssProtection: XSSProtectionConfig;
  /** CSRF保护配置 */
  csrfProtection: CSRFProtectionConfig;
  /** 登录尝试限制 */
  loginAttemptLimit: {
    /** 允许的失败尝试次数 */
    maxAttempts: number;
    /** 锁定时间（分钟） */
    lockoutTime: number;
    /** 是否启用 */
    enabled: boolean;
  };
  /** 是否启用HTTPS强制 */
  enforceHttps: boolean;
  /** 是否启用安全cookie */
  secureCookies: boolean;
  /** 是否启用内容安全策略 */
  contentSecurityPolicy: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 最后应用时间 */
  lastAppliedAt?: Date;
  /** 应用状态 */
  applied: boolean;
}

export interface SecurityAuditLog {
  /** 审计日志ID */
  id: string;
  /** 事件类型 */
  eventType: string;
  /** 事件描述 */
  description: string;
  /** 用户名 */
  username: string;
  /** 用户ID */
  userId?: string;
  /** 客户端IP */
  clientIp: string;
  /** 客户端User-Agent */
  userAgent: string;
  /** 事件时间 */
  timestamp: Date;
  /** 事件结果 */
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  /** 相关资源 */
  resource?: string;
  /** 操作 */
  action?: string;
  /** 附加信息 */
  metadata: Record<string, any>;
}

export interface SecurityScanResult {
  /** 扫描ID */
  id: string;
  /** 扫描时间 */
  scanTime: Date;
  /** 扫描结果 */
  scanResults: {
    /** 漏洞名称 */
    name: string;
    /** 漏洞描述 */
    description: string;
    /** 漏洞严重性 */
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    /** 漏洞修复建议 */
    recommendation: string;
    /** 漏洞位置 */
    location: string;
    /** 是否已修复 */
    fixed: boolean;
  }[];
  /** 扫描状态 */
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  /** 扫描持续时间（秒） */
  duration: number;
  /** 安全得分 */
  securityScore: number;
}

export interface SecurityEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: 'AUTH_FAILURE' | 'AUTH_SUCCESS' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'ROLE_CHANGED' | 'SECURITY_CONFIG_CHANGED' | 'VULNERABILITY_DETECTED' | 'ANOMALY_DETECTED';
  /** 事件时间 */
  timestamp: Date;
  /** 事件详情 */
  details: Record<string, any>;
  /** 事件来源 */
  source: string;
  /** 事件影响 */
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 是否已处理 */
  processed: boolean;
}
