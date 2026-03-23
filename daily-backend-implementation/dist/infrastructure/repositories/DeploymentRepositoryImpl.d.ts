import { DeploymentRepository } from '../../domain/repositories/DeploymentRepository';
import { DeploymentConfig, DeploymentTask, DeploymentHistory, DeploymentEnvironmentConfig, DeploymentArtifact, DeploymentValidationResult, DeploymentEnvironment, DeploymentStatus } from '../../domain/entities/DeploymentConfig';
export declare class DeploymentRepositoryImpl implements DeploymentRepository {
    private deploymentConfigs;
    private deploymentTasks;
    private deploymentHistory;
    private environmentConfigs;
    private deploymentArtifacts;
    private deploymentValidationResults;
    saveDeploymentConfig(config: DeploymentConfig): Promise<DeploymentConfig>;
    getDeploymentConfigs(environment?: DeploymentEnvironment): Promise<DeploymentConfig[]>;
    getDeploymentConfigById(configId: string): Promise<DeploymentConfig | null>;
    deleteDeploymentConfig(configId: string): Promise<boolean>;
    saveDeploymentTask(task: DeploymentTask): Promise<DeploymentTask>;
    getDeploymentTasks(environment?: DeploymentEnvironment, status?: DeploymentStatus): Promise<DeploymentTask[]>;
    getDeploymentTaskById(taskId: string): Promise<DeploymentTask | null>;
    updateDeploymentTaskStatus(taskId: string, status: DeploymentStatus, result?: Record<string, any>, errorMessage?: string): Promise<DeploymentTask>;
    saveDeploymentHistory(history: DeploymentHistory): Promise<DeploymentHistory>;
    getDeploymentHistory(environment?: DeploymentEnvironment, limit?: number): Promise<DeploymentHistory[]>;
    getDeploymentHistoryById(historyId: string): Promise<DeploymentHistory | null>;
    cleanOldDeploymentHistory(days: number): Promise<number>;
    saveEnvironmentConfig(config: DeploymentEnvironmentConfig): Promise<DeploymentEnvironmentConfig>;
    getEnvironmentConfigs(): Promise<DeploymentEnvironmentConfig[]>;
    getEnvironmentConfigByEnvironment(environment: DeploymentEnvironment): Promise<DeploymentEnvironmentConfig | null>;
    deleteEnvironmentConfig(environment: DeploymentEnvironment): Promise<boolean>;
    saveDeploymentArtifact(artifact: DeploymentArtifact): Promise<DeploymentArtifact>;
    getDeploymentArtifacts(name?: string, version?: string): Promise<DeploymentArtifact[]>;
    getDeploymentArtifactById(artifactId: string): Promise<DeploymentArtifact | null>;
    deleteDeploymentArtifact(artifactId: string): Promise<boolean>;
    saveDeploymentValidationResult(result: DeploymentValidationResult): Promise<DeploymentValidationResult>;
    getDeploymentValidationResults(configId: string): Promise<DeploymentValidationResult[]>;
    getDeploymentValidationResultById(resultId: string): Promise<DeploymentValidationResult | null>;
}
//# sourceMappingURL=DeploymentRepositoryImpl.d.ts.map