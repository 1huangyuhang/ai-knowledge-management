"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentRepositoryImpl = void 0;
const DeploymentConfig_1 = require("../../domain/entities/DeploymentConfig");
class DeploymentRepositoryImpl {
    deploymentConfigs = new Map();
    deploymentTasks = new Map();
    deploymentHistory = new Map();
    environmentConfigs = new Map();
    deploymentArtifacts = new Map();
    deploymentValidationResults = new Map();
    async saveDeploymentConfig(config) {
        this.deploymentConfigs.set(config.id, config);
        return config;
    }
    async getDeploymentConfigs(environment) {
        let configs = Array.from(this.deploymentConfigs.values());
        if (environment) {
            configs = configs.filter(config => config.environment === environment);
        }
        return configs;
    }
    async getDeploymentConfigById(configId) {
        return this.deploymentConfigs.get(configId) || null;
    }
    async deleteDeploymentConfig(configId) {
        return this.deploymentConfigs.delete(configId);
    }
    async saveDeploymentTask(task) {
        this.deploymentTasks.set(task.id, task);
        return task;
    }
    async getDeploymentTasks(environment, status) {
        let tasks = Array.from(this.deploymentTasks.values());
        if (environment) {
            tasks = tasks.filter(task => task.environment === environment);
        }
        if (status) {
            tasks = tasks.filter(task => task.status === status);
        }
        return tasks;
    }
    async getDeploymentTaskById(taskId) {
        return this.deploymentTasks.get(taskId) || null;
    }
    async updateDeploymentTaskStatus(taskId, status, result, errorMessage) {
        const task = this.deploymentTasks.get(taskId);
        if (!task) {
            throw new Error(`Deployment task with id ${taskId} not found`);
        }
        const updatedTask = {
            ...task,
            status,
            result: result || task.result,
            errorMessage: errorMessage || task.errorMessage,
            updatedAt: new Date(),
            endTime: status !== DeploymentConfig_1.DeploymentStatus.IN_PROGRESS ? new Date() : task.endTime,
            startTime: status === DeploymentConfig_1.DeploymentStatus.IN_PROGRESS && !task.startTime ? new Date() : task.startTime
        };
        this.deploymentTasks.set(taskId, updatedTask);
        return updatedTask;
    }
    async saveDeploymentHistory(history) {
        this.deploymentHistory.set(history.id, history);
        return history;
    }
    async getDeploymentHistory(environment, limit) {
        let history = Array.from(this.deploymentHistory.values());
        if (environment) {
            history = history.filter(h => h.environment === environment);
        }
        history.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
        if (limit) {
            history = history.slice(0, limit);
        }
        return history;
    }
    async getDeploymentHistoryById(historyId) {
        return this.deploymentHistory.get(historyId) || null;
    }
    async cleanOldDeploymentHistory(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        let deletedCount = 0;
        for (const [id, history] of this.deploymentHistory.entries()) {
            if (history.endTime < cutoffDate) {
                this.deploymentHistory.delete(id);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async saveEnvironmentConfig(config) {
        this.environmentConfigs.set(config.environment, config);
        return config;
    }
    async getEnvironmentConfigs() {
        return Array.from(this.environmentConfigs.values());
    }
    async getEnvironmentConfigByEnvironment(environment) {
        return this.environmentConfigs.get(environment) || null;
    }
    async deleteEnvironmentConfig(environment) {
        return this.environmentConfigs.delete(environment);
    }
    async saveDeploymentArtifact(artifact) {
        this.deploymentArtifacts.set(artifact.id, artifact);
        return artifact;
    }
    async getDeploymentArtifacts(name, version) {
        let artifacts = Array.from(this.deploymentArtifacts.values());
        if (name) {
            artifacts = artifacts.filter(artifact => artifact.name === name);
        }
        if (version) {
            artifacts = artifacts.filter(artifact => artifact.version === version);
        }
        return artifacts;
    }
    async getDeploymentArtifactById(artifactId) {
        return this.deploymentArtifacts.get(artifactId) || null;
    }
    async deleteDeploymentArtifact(artifactId) {
        return this.deploymentArtifacts.delete(artifactId);
    }
    async saveDeploymentValidationResult(result) {
        this.deploymentValidationResults.set(result.id, result);
        return result;
    }
    async getDeploymentValidationResults(configId) {
        return Array.from(this.deploymentValidationResults.values())
            .filter(result => result.configId === configId);
    }
    async getDeploymentValidationResultById(resultId) {
        return this.deploymentValidationResults.get(resultId) || null;
    }
}
exports.DeploymentRepositoryImpl = DeploymentRepositoryImpl;
//# sourceMappingURL=DeploymentRepositoryImpl.js.map