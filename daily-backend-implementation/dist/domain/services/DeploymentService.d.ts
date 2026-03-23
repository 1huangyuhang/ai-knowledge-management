import { DeploymentConfig, DeploymentTask, DeploymentHistory, DeploymentEnvironmentConfig, DeploymentArtifact, DeploymentValidationResult, DeploymentEnvironment, DeploymentStatus } from '../entities/DeploymentConfig';
export interface DeploymentService {
    getDeploymentConfigs(environment?: DeploymentEnvironment): Promise<DeploymentConfig[]>;
    getDeploymentConfigById(configId: string): Promise<DeploymentConfig>;
    createDeploymentConfig(config: Omit<DeploymentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeploymentConfig>;
    updateDeploymentConfig(configId: string, config: Partial<DeploymentConfig>): Promise<DeploymentConfig>;
    deleteDeploymentConfig(configId: string): Promise<boolean>;
    validateDeploymentConfig(configId: string): Promise<DeploymentValidationResult>;
    createDeploymentTask(configId: string, deployedBy: string, taskParams?: Record<string, any>): Promise<DeploymentTask>;
    getDeploymentTasks(environment?: DeploymentEnvironment, status?: DeploymentStatus): Promise<DeploymentTask[]>;
    getDeploymentTaskById(taskId: string): Promise<DeploymentTask>;
    executeDeploymentTask(taskId: string): Promise<boolean>;
    cancelDeploymentTask(taskId: string): Promise<boolean>;
    rollbackDeploymentTask(taskId: string, rolledBackBy: string): Promise<boolean>;
    getDeploymentHistory(environment?: DeploymentEnvironment, limit?: number): Promise<DeploymentHistory[]>;
    getDeploymentHistoryById(historyId: string): Promise<DeploymentHistory>;
    getEnvironmentConfigs(): Promise<DeploymentEnvironmentConfig[]>;
    getEnvironmentConfigByEnvironment(environment: DeploymentEnvironment): Promise<DeploymentEnvironmentConfig>;
    upsertEnvironmentConfig(config: DeploymentEnvironmentConfig): Promise<DeploymentEnvironmentConfig>;
    deleteEnvironmentConfig(environment: DeploymentEnvironment): Promise<boolean>;
    getDeploymentArtifacts(name?: string, version?: string): Promise<DeploymentArtifact[]>;
    getDeploymentArtifactById(artifactId: string): Promise<DeploymentArtifact>;
    registerDeploymentArtifact(artifact: Omit<DeploymentArtifact, 'id' | 'createdAt'>): Promise<DeploymentArtifact>;
    deleteDeploymentArtifact(artifactId: string): Promise<boolean>;
    getDeploymentValidationResults(configId: string): Promise<DeploymentValidationResult[]>;
    cleanOldDeploymentHistory(days: number): Promise<number>;
    getCurrentDeploymentStatus(environment: DeploymentEnvironment): Promise<DeploymentStatus>;
    getDeploymentStatistics(environment?: DeploymentEnvironment): Promise<Record<string, any>>;
}
//# sourceMappingURL=DeploymentService.d.ts.map