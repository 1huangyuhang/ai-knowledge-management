export declare enum MonitorType {
    CPU = "CPU",
    MEMORY = "MEMORY",
    DISK = "DISK",
    NETWORK = "NETWORK",
    APP_PERFORMANCE = "APP_PERFORMANCE",
    DATABASE = "DATABASE",
    API = "API",
    ERROR = "ERROR",
    BUSINESS = "BUSINESS"
}
export declare enum AlertLevel {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL"
}
export declare enum AlertStatus {
    PENDING = "PENDING",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare enum AlertChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    WEBHOOK = "WEBHOOK",
    SLACK = "SLACK",
    TEAMS = "TEAMS",
    CUSTOM = "CUSTOM"
}
export interface MonitoringConfig {
    id: string;
    name: string;
    description?: string;
    monitorTypes: MonitorType[];
    enabled: boolean;
    samplingInterval: number;
    dataRetentionDays: number;
    alertsEnabled: boolean;
    defaultAlertLevel: AlertLevel;
    defaultAlertChannels: AlertChannel[];
    createdAt: Date;
    updatedAt: Date;
    configParams?: Record<string, any>;
}
export interface MonitorMetric {
    id: string;
    name: string;
    type: MonitorType;
    value: number;
    unit: string;
    tags?: Record<string, string>;
    timestamp: Date;
    moduleName?: string;
    instanceId?: string;
}
export interface AlertRule {
    id: string;
    name: string;
    description?: string;
    monitorType: MonitorType;
    metricName: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'in' | 'not_in';
    threshold: number | number[];
    alertLevel: AlertLevel;
    duration: number;
    alertChannels: AlertChannel[];
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    ruleParams?: Record<string, any>;
}
export interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    level: AlertLevel;
    status: AlertStatus;
    monitorType: MonitorType;
    metricName: string;
    metricValue: number;
    threshold: number | number[];
    description: string;
    details?: Record<string, any>;
    triggeredAt: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    closedAt?: Date;
    closedBy?: string;
    moduleName?: string;
    instanceId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Dashboard {
    id: string;
    name: string;
    description?: string;
    layout: Record<string, any>;
    widgets: DashboardWidget[];
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[];
}
export interface DashboardWidget {
    id: string;
    name: string;
    type: 'CHART' | 'GAUGE' | 'COUNTER' | 'TABLE' | 'TEXT' | 'MAP';
    config: Record<string, any>;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    monitorType: MonitorType;
    metricName: string;
    refreshInterval: number;
}
export interface MonitoringReport {
    id: string;
    name: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    period: {
        start: Date;
        end: Date;
    };
    content: Record<string, any>;
    status: 'GENERATED' | 'FAILED' | 'PENDING';
    generatedAt?: Date;
    generatedBy: string;
    createdAt: Date;
    reportUrl?: string;
}
export interface HealthCheck {
    id: string;
    name: string;
    type: 'HTTP' | 'TCP' | 'PING' | 'CUSTOM';
    target: string;
    status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
    result: Record<string, any>;
    responseTime: number;
    lastCheckedAt: Date;
    nextCheckAt: Date;
    createdAt: Date;
    updatedAt: Date;
    config?: Record<string, any>;
}
export interface MonitoringAgent {
    id: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    type: 'HOST' | 'CONTAINER' | 'K8S' | 'CUSTOM';
    version: string;
    hostname: string;
    ipAddress: string;
    lastHeartbeatAt: Date;
    registeredAt: Date;
    updatedAt: Date;
    config?: Record<string, any>;
}
//# sourceMappingURL=MonitoringConfig.d.ts.map