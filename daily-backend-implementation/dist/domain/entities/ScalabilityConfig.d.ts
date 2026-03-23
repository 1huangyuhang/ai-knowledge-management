export declare enum ScalabilityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum ScalingStrategy {
    MANUAL = "MANUAL",
    AUTOMATIC = "AUTOMATIC",
    HYBRID = "HYBRID"
}
export declare enum ResourceType {
    COMPUTE = "COMPUTE",
    MEMORY = "MEMORY",
    STORAGE = "STORAGE",
    NETWORK = "NETWORK",
    DATABASE = "DATABASE"
}
export interface ScalabilityThreshold {
    resourceType: ResourceType;
    threshold: number;
    duration: number;
}
export interface ScalabilityConfig {
    id: string;
    scalabilityLevel: ScalabilityLevel;
    scalingStrategy: ScalingStrategy;
    scalingThresholds: ScalabilityThreshold[];
    minInstances: number;
    maxInstances: number;
    instanceIncrement: number;
    coolDownPeriod: number;
    autoScalingEnabled: boolean;
    loadBalancingEnabled: boolean;
    horizontalScalingEnabled: boolean;
    verticalScalingEnabled: boolean;
    autoScalingGroupConfig?: {
        name: string;
        launchConfigurationId: string;
        availabilityZones: string[];
    };
    loadBalancerConfig?: {
        name: string;
        type: 'ALB' | 'CLB' | 'NLB';
        listeners: {
            port: number;
            protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
            targetGroupArn: string;
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
    lastAppliedAt?: Date;
    applied: boolean;
}
export interface ScalabilityMetric {
    id: string;
    resourceType: ResourceType;
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    instanceId?: string;
    resourceId?: string;
}
export interface ScalabilityEvent {
    id: string;
    type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_FAILED' | 'THRESHOLD_EXCEEDED' | 'COOL_DOWN_STARTED' | 'COOL_DOWN_ENDED' | 'CONFIGURATION_UPDATED';
    timestamp: Date;
    details: Record<string, any>;
    source: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    processed: boolean;
}
export interface ScalabilityReport {
    id: string;
    reportTime: Date;
    reportPeriod: number;
    resourceUtilization: {
        resourceType: ResourceType;
        average: number;
        peak: number;
        minimum: number;
        p95: number;
        p99: number;
    }[];
    scalingEvents: {
        type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_FAILED';
        count: number;
    }[];
    instanceStatistics: {
        averageInstances: number;
        peakInstances: number;
        minimumInstances: number;
    };
    scalabilityScore: number;
    recommendations: string[];
}
export interface ScalabilityTestResult {
    id: string;
    testName: string;
    testDescription: string;
    startTime: Date;
    endTime: Date;
    status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
    loadConfig: {
        initialUsers: number;
        targetUsers: number;
        rampUpRate: number;
        duration: number;
    };
    metrics: {
        averageResponseTime: number;
        peakResponseTime: number;
        throughput: number;
        errorRate: number;
        maxConcurrentUsers: number;
        resourceUtilization: {
            resourceType: ResourceType;
            average: number;
            peak: number;
        }[];
    };
    conclusion: string;
    recommendations: string[];
}
//# sourceMappingURL=ScalabilityConfig.d.ts.map