export declare enum DeploymentEnvironment {
    DEVELOPMENT = "DEVELOPMENT",
    TESTING = "TESTING",
    STAGING = "STAGING",
    PRODUCTION = "PRODUCTION"
}
export declare enum DeploymentStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ROLLED_BACK = "ROLLED_BACK"
}
export declare enum DeploymentStrategy {
    BLUE_GREEN = "BLUE_GREEN",
    ROLLING = "ROLLING",
    CANARY = "CANARY",
    FULL = "FULL"
}
export interface DeploymentConfig {
    id: string;
    environment: DeploymentEnvironment;
    strategy: DeploymentStrategy;
    name: string;
    description?: string;
    targetHosts: string[];
    targetPort: number;
    version: string;
    deployScriptPath?: string;
    preDeployScriptPath?: string;
    postDeployScriptPath?: string;
    rollbackScriptPath?: string;
    autoRollback: boolean;
    autoRollbackTimeout: number;
    deployTimeout: number;
    healthCheckEnabled: boolean;
    healthCheckUrl?: string;
    healthCheckInterval: number;
    healthCheckTimeout: number;
    healthCheckRetries: number;
    parallelism: number;
    batchSize?: number;
    canaryPercentage?: number;
    createdAt: Date;
    updatedAt: Date;
    enabled: boolean;
    configParams?: Record<string, any>;
}
export interface DeploymentTask {
    id: string;
    configId: string;
    environment: DeploymentEnvironment;
    version: string;
    status: DeploymentStatus;
    strategy: DeploymentStrategy;
    targetHosts: string[];
    startTime?: Date;
    endTime?: Date;
    logsUrl?: string;
    errorMessage?: string;
    result?: Record<string, any>;
    deployedBy: string;
    createdAt: Date;
    updatedAt: Date;
    taskParams?: Record<string, any>;
}
export interface DeploymentHistory {
    id: string;
    taskId: string;
    environment: DeploymentEnvironment;
    version: string;
    status: DeploymentStatus;
    deployedBy: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    resultSummary: string;
    logsUrl?: string;
    createdAt: Date;
}
export interface DeploymentEnvironmentConfig {
    id: string;
    environment: DeploymentEnvironment;
    name: string;
    description?: string;
    url?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    configParams: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface DeploymentArtifact {
    id: string;
    name: string;
    type: 'DOCKER_IMAGE' | 'JAR' | 'ZIP' | 'TAR' | 'OTHER';
    version: string;
    url: string;
    checksum?: string;
    size?: number;
    createdAt: Date;
    buildId?: string;
    buildVersion?: string;
}
export interface DeploymentValidationResult {
    id: string;
    configId: string;
    status: 'PASSED' | 'FAILED' | 'WARNING';
    validationItems: {
        name: string;
        status: 'PASSED' | 'FAILED' | 'WARNING';
        message: string;
        details?: any;
    }[];
    validatedAt: Date;
    validatedBy?: string;
}
//# sourceMappingURL=DeploymentConfig.d.ts.map