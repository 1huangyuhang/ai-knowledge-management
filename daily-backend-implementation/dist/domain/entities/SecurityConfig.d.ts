export declare enum SecurityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum EncryptionAlgorithm {
    AES_256 = "AES-256",
    RSA_2048 = "RSA-2048",
    RSA_4096 = "RSA-4096",
    SHA_256 = "SHA-256",
    SHA_512 = "SHA-512"
}
export declare enum AuthMethod {
    TOKEN = "TOKEN",
    PASSWORD = "PASSWORD",
    MFA = "MFA",
    API_KEY = "API_KEY"
}
export interface RateLimitConfig {
    window: number;
    limit: number;
    enabled: boolean;
}
export interface CORSConfig {
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
    enabled: boolean;
}
export interface SecurityAuditConfig {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}
export interface XSSProtectionConfig {
    enabled: boolean;
    strictMode: boolean;
}
export interface CSRFProtectionConfig {
    enabled: boolean;
    tokenExpiry: number;
}
export interface SecurityConfig {
    id: string;
    securityLevel: SecurityLevel;
    authMethods: AuthMethod[];
    encryptionAlgorithm: EncryptionAlgorithm;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireDigits: boolean;
        requireSpecialChars: boolean;
        expiryDays: number;
        historyLength: number;
    };
    rateLimit: RateLimitConfig;
    cors: CORSConfig;
    audit: SecurityAuditConfig;
    xssProtection: XSSProtectionConfig;
    csrfProtection: CSRFProtectionConfig;
    loginAttemptLimit: {
        maxAttempts: number;
        lockoutTime: number;
        enabled: boolean;
    };
    enforceHttps: boolean;
    secureCookies: boolean;
    contentSecurityPolicy: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAppliedAt?: Date;
    applied: boolean;
}
export interface SecurityAuditLog {
    id: string;
    eventType: string;
    description: string;
    username: string;
    userId?: string;
    clientIp: string;
    userAgent: string;
    timestamp: Date;
    result: 'SUCCESS' | 'FAILURE' | 'WARNING';
    resource?: string;
    action?: string;
    metadata: Record<string, any>;
}
export interface SecurityScanResult {
    id: string;
    scanTime: Date;
    scanResults: {
        name: string;
        description: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        recommendation: string;
        location: string;
        fixed: boolean;
    }[];
    status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
    duration: number;
    securityScore: number;
}
export interface SecurityEvent {
    id: string;
    type: 'AUTH_FAILURE' | 'AUTH_SUCCESS' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'ROLE_CHANGED' | 'SECURITY_CONFIG_CHANGED' | 'VULNERABILITY_DETECTED' | 'ANOMALY_DETECTED';
    timestamp: Date;
    details: Record<string, any>;
    source: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    processed: boolean;
}
//# sourceMappingURL=SecurityConfig.d.ts.map