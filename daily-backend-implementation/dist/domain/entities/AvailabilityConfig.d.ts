export declare enum AvailabilityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum AvailabilityStrategy {
    ACTIVE_REDUNDANCY = "ACTIVE_REDUNDANCY",
    PASSIVE_REDUNDANCY = "PASSIVE_REDUNDANCY",
    HYBRID_REDUNDANCY = "HYBRID_REDUNDANCY",
    NO_REDUNDANCY = "NO_REDUNDANCY"
}
export declare enum HealthCheckType {
    HTTP = "HTTP",
    TCP = "TCP",
    COMMAND = "COMMAND",
    CUSTOM = "CUSTOM"
}
export interface HealthCheckConfig {
    type: HealthCheckType;
    target: string;
    interval: number;
    timeout: number;
    failureThreshold: number;
    successThreshold: number;
    path?: string;
    port?: number;
    command?: string;
}
export interface FailoverConfig {
    enabled: boolean;
    delay: number;
    recoveryDelay: number;
    autoRecoveryEnabled: boolean;
}
export interface LoadBalancingConfig {
    enabled: boolean;
    algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH' | 'WEIGHTED_ROUND_ROBIN';
    sessionPersistenceEnabled: boolean;
    sessionTimeout: number;
}
export interface AvailabilityConfig {
    id: string;
    availabilityLevel: AvailabilityLevel;
    availabilityStrategy: AvailabilityStrategy;
    healthCheckConfigs: HealthCheckConfig[];
    failoverConfig: FailoverConfig;
    loadBalancingConfig: LoadBalancingConfig;
    redundancyInstances: number;
    maxFailureInstances: number;
    autoRecoveryEnabled: boolean;
    monitoringEnabled: boolean;
    alertingEnabled: boolean;
    maintenanceWindowConfig?: {
        startTime: string;
        endTime: string;
        timezone: string;
        daysOfWeek: number[];
    };
    createdAt: Date;
    updatedAt: Date;
    lastAppliedAt?: Date;
    applied: boolean;
}
export declare enum HealthStatus {
    HEALTHY = "HEALTHY",
    UNHEALTHY = "UNHEALTHY",
    WARNING = "WARNING",
    UNKNOWN = "UNKNOWN"
}
export interface HealthCheckResult {
    id: string;
    healthCheckConfigId: string;
    checkTime: Date;
    status: HealthStatus;
    responseTime: number;
    message: string;
    target: string;
    type: HealthCheckType;
}
export interface AvailabilityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    type: 'UPTIME' | 'DOWNTIME' | 'AVAILABILITY_PERCENTAGE' | 'RESPONSE_TIME' | 'ERROR_RATE';
    serviceName?: string;
}
export interface AvailabilityEvent {
    id: string;
    type: 'SERVICE_UP' | 'SERVICE_DOWN' | 'SERVICE_WARNING' | 'FAILOVER_TRIGGERED' | 'FAILOVER_COMPLETED' | 'RECOVERY_TRIGGERED' | 'RECOVERY_COMPLETED' | 'MAINTENANCE_STARTED' | 'MAINTENANCE_ENDED';
    timestamp: Date;
    details: Record<string, any>;
    source: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    processed: boolean;
    serviceName?: string;
}
export interface AvailabilityReport {
    id: string;
    reportTime: Date;
    reportPeriod: number;
    availabilityStats: {
        uptime: number;
        downtime: number;
        availabilityPercentage: number;
        averageResponseTime: number;
        peakResponseTime: number;
        errorRate: number;
    };
    eventStats: {
        type: string;
        count: number;
    }[];
    healthCheckStats: {
        healthCheckConfigId: string;
        totalChecks: number;
        successfulChecks: number;
        failedChecks: number;
        warningChecks: number;
        successRate: number;
    }[];
    availabilityScore: number;
    recommendations: string[];
}
export interface AvailabilityTestResult {
    id: string;
    testName: string;
    testDescription: string;
    startTime: Date;
    endTime: Date;
    status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
    testConfig: {
        type: 'FAILURE_SIMULATION' | 'LOAD_TEST' | 'STRESS_TEST' | 'RECOVERY_TEST';
        parameters: Record<string, any>;
    };
    metrics: {
        availabilityPercentage: number;
        averageRecoveryTime: number;
        maxRecoveryTime: number;
        failoverSuccessRate: number;
        errorCount: number;
    };
    conclusion: string;
    recommendations: string[];
}
//# sourceMappingURL=AvailabilityConfig.d.ts.map