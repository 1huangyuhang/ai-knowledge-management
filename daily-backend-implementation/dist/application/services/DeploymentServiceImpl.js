"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentServiceImpl = void 0;
const tslib_1 = require("tslib");
const DeploymentConfig_1 = require("../../domain/entities/DeploymentConfig");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class DeploymentServiceImpl {
    deploymentRepository;
    constructor(deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }
    async getDeploymentConfigs(environment) {
        return await this.deploymentRepository.getDeploymentConfigs(environment);
    }
    async getDeploymentConfigById(configId) {
        const config = await this.deploymentRepository.getDeploymentConfigById(configId);
        if (!config) {
            throw new Error(`Deployment config with id ${configId} not found`);
        }
        return config;
    }
    async createDeploymentConfig(config) {
        const newConfig = {
            ...config,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await this.deploymentRepository.saveDeploymentConfig(newConfig);
    }
    async updateDeploymentConfig(configId, config) {
        const existingConfig = await this.getDeploymentConfigById(configId);
        const updatedConfig = {
            ...existingConfig,
            ...config,
            updatedAt: new Date()
        };
        return await this.deploymentRepository.saveDeploymentConfig(updatedConfig);
    }
    async deleteDeploymentConfig(configId) {
        const tasks = await this.deploymentRepository.getDeploymentTasks();
        const hasRelatedTasks = tasks.some(task => task.configId === configId);
        if (hasRelatedTasks) {
            throw new Error('Cannot delete deployment config with related deployment tasks');
        }
        return await this.deploymentRepository.deleteDeploymentConfig(configId);
    }
    async validateDeploymentConfig(configId) {
        const config = await this.getDeploymentConfigById(configId);
        const validationItems = [];
        let overallStatus = 'PASSED';
        if (!config.targetHosts || config.targetHosts.length === 0) {
            validationItems.push({
                name: 'targetHosts',
                status: 'FAILED',
                message: 'Target hosts list cannot be empty'
            });
            overallStatus = 'FAILED';
        }
        else {
            validationItems.push({
                name: 'targetHosts',
                status: 'PASSED',
                message: 'Target hosts list is valid'
            });
        }
        if (config.targetPort < 1 || config.targetPort > 65535) {
            validationItems.push({
                name: 'targetPort',
                status: 'FAILED',
                message: 'Target port must be between 1 and 65535'
            });
            overallStatus = 'FAILED';
        }
        else {
            validationItems.push({
                name: 'targetPort',
                status: 'PASSED',
                message: 'Target port is valid'
            });
        }
        if (config.strategy === DeploymentConfig_1.DeploymentStrategy.ROLLING && (!config.batchSize || config.batchSize <= 0)) {
            validationItems.push({
                name: 'batchSize',
                status: 'WARNING',
                message: 'Batch size should be set for rolling deployment strategy'
            });
            if (overallStatus !== 'FAILED') {
                overallStatus = 'WARNING';
            }
        }
        else if (config.strategy === DeploymentConfig_1.DeploymentStrategy.CANARY && (!config.canaryPercentage || config.canaryPercentage <= 0 || config.canaryPercentage > 100)) {
            validationItems.push({
                name: 'canaryPercentage',
                status: 'WARNING',
                message: 'Canary percentage should be between 1 and 100 for canary deployment strategy'
            });
            if (overallStatus !== 'FAILED') {
                overallStatus = 'WARNING';
            }
        }
        else {
            validationItems.push({
                name: 'strategyConfig',
                status: 'PASSED',
                message: 'Deployment strategy configuration is valid'
            });
        }
        if (config.healthCheckEnabled && !config.healthCheckUrl) {
            validationItems.push({
                name: 'healthCheckUrl',
                status: 'WARNING',
                message: 'Health check URL should be set when health check is enabled'
            });
            if (overallStatus !== 'FAILED') {
                overallStatus = 'WARNING';
            }
        }
        else {
            validationItems.push({
                name: 'healthCheckConfig',
                status: 'PASSED',
                message: 'Health check configuration is valid'
            });
        }
        const validationResult = {
            id: crypto_1.default.randomUUID(),
            configId,
            status: overallStatus,
            validationItems,
            validatedAt: new Date()
        };
        await this.deploymentRepository.saveDeploymentValidationResult(validationResult);
        return validationResult;
    }
    async createDeploymentTask(configId, deployedBy, taskParams) {
        const config = await this.getDeploymentConfigById(configId);
        const newTask = {
            id: crypto_1.default.randomUUID(),
            configId,
            environment: config.environment,
            version: config.version,
            status: DeploymentConfig_1.DeploymentStatus.PENDING,
            strategy: config.strategy,
            targetHosts: config.targetHosts,
            deployedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            taskParams
        };
        return await this.deploymentRepository.saveDeploymentTask(newTask);
    }
    async getDeploymentTasks(environment, status) {
        return await this.deploymentRepository.getDeploymentTasks(environment, status);
    }
    async getDeploymentTaskById(taskId) {
        const task = await this.deploymentRepository.getDeploymentTaskById(taskId);
        if (!task) {
            throw new Error(`Deployment task with id ${taskId} not found`);
        }
        return task;
    }
    async executeDeploymentTask(taskId) {
        const task = await this.getDeploymentTaskById(taskId);
        const config = await this.getDeploymentConfigById(task.configId);
        await this.deploymentRepository.updateDeploymentTaskStatus(taskId, DeploymentConfig_1.DeploymentStatus.IN_PROGRESS);
        try {
            console.log(`Executing deployment task ${taskId} for environment ${task.environment}`);
            console.log(`Deployment strategy: ${task.strategy}`);
            console.log(`Target hosts: ${task.targetHosts.join(', ')}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const result = {
                deployedHosts: task.targetHosts,
                deploymentStrategy: task.strategy,
                version: task.version,
                deployedAt: new Date().toISOString()
            };
            await this.deploymentRepository.updateDeploymentTaskStatus(taskId, DeploymentConfig_1.DeploymentStatus.SUCCESS, result);
            const history = {
                id: crypto_1.default.randomUUID(),
                taskId,
                environment: task.environment,
                version: task.version,
                status: DeploymentConfig_1.DeploymentStatus.SUCCESS,
                deployedBy: task.deployedBy,
                startTime: task.startTime || new Date(),
                endTime: new Date(),
                duration: Math.floor((new Date().getTime() - (task.startTime || new Date()).getTime()) / 1000),
                resultSummary: `Successfully deployed version ${task.version} to ${task.targetHosts.length} hosts`,
                createdAt: new Date()
            };
            await this.deploymentRepository.saveDeploymentHistory(history);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
            await this.deploymentRepository.updateDeploymentTaskStatus(taskId, DeploymentConfig_1.DeploymentStatus.FAILURE, undefined, errorMessage);
            const history = {
                id: crypto_1.default.randomUUID(),
                taskId,
                environment: task.environment,
                version: task.version,
                status: DeploymentConfig_1.DeploymentStatus.FAILURE,
                deployedBy: task.deployedBy,
                startTime: task.startTime || new Date(),
                endTime: new Date(),
                duration: Math.floor((new Date().getTime() - (task.startTime || new Date()).getTime()) / 1000),
                resultSummary: `Failed to deploy version ${task.version}: ${errorMessage}`,
                createdAt: new Date()
            };
            await this.deploymentRepository.saveDeploymentHistory(history);
            return false;
        }
    }
    async cancelDeploymentTask(taskId) {
        const task = await this.getDeploymentTaskById(taskId);
        if (task.status !== DeploymentConfig_1.DeploymentStatus.PENDING && task.status !== DeploymentConfig_1.DeploymentStatus.IN_PROGRESS) {
            throw new Error(`Cannot cancel deployment task with status ${task.status}`);
        }
        await this.deploymentRepository.updateDeploymentTaskStatus(taskId, DeploymentConfig_1.DeploymentStatus.FAILURE, undefined, 'Deployment task cancelled by user');
        return true;
    }
    async rollbackDeploymentTask(taskId, rolledBackBy) {
        const task = await this.getDeploymentTaskById(taskId);
        if (task.status !== DeploymentConfig_1.DeploymentStatus.SUCCESS) {
            throw new Error(`Cannot rollback deployment task with status ${task.status}`);
        }
        console.log(`Rolling back deployment task ${taskId} for environment ${task.environment}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.deploymentRepository.updateDeploymentTaskStatus(taskId, DeploymentConfig_1.DeploymentStatus.ROLLED_BACK, { rolledBackBy, rolledBackAt: new Date().toISOString() });
        const history = {
            id: crypto_1.default.randomUUID(),
            taskId,
            environment: task.environment,
            version: task.version,
            status: DeploymentConfig_1.DeploymentStatus.ROLLED_BACK,
            deployedBy: rolledBackBy,
            startTime: new Date(),
            endTime: new Date(),
            duration: 2,
            resultSummary: `Successfully rolled back version ${task.version}`,
            createdAt: new Date()
        };
        await this.deploymentRepository.saveDeploymentHistory(history);
        return true;
    }
    async getDeploymentHistory(environment, limit) {
        return await this.deploymentRepository.getDeploymentHistory(environment, limit);
    }
    async getDeploymentHistoryById(historyId) {
        const history = await this.deploymentRepository.getDeploymentHistoryById(historyId);
        if (!history) {
            throw new Error(`Deployment history with id ${historyId} not found`);
        }
        return history;
    }
    async getEnvironmentConfigs() {
        return await this.deploymentRepository.getEnvironmentConfigs();
    }
    async getEnvironmentConfigByEnvironment(environment) {
        const config = await this.deploymentRepository.getEnvironmentConfigByEnvironment(environment);
        if (!config) {
            throw new Error(`Environment config for ${environment} not found`);
        }
        return config;
    }
    async upsertEnvironmentConfig(config) {
        return await this.deploymentRepository.saveEnvironmentConfig(config);
    }
    async deleteEnvironmentConfig(environment) {
        return await this.deploymentRepository.deleteEnvironmentConfig(environment);
    }
    async getDeploymentArtifacts(name, version) {
        return await this.deploymentRepository.getDeploymentArtifacts(name, version);
    }
    async getDeploymentArtifactById(artifactId) {
        const artifact = await this.deploymentRepository.getDeploymentArtifactById(artifactId);
        if (!artifact) {
            throw new Error(`Deployment artifact with id ${artifactId} not found`);
        }
        return artifact;
    }
    async registerDeploymentArtifact(artifact) {
        const newArtifact = {
            ...artifact,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date()
        };
        return await this.deploymentRepository.saveDeploymentArtifact(newArtifact);
    }
    async deleteDeploymentArtifact(artifactId) {
        return await this.deploymentRepository.deleteDeploymentArtifact(artifactId);
    }
    async getDeploymentValidationResults(configId) {
        return await this.deploymentRepository.getDeploymentValidationResults(configId);
    }
    async cleanOldDeploymentHistory(days) {
        return await this.deploymentRepository.cleanOldDeploymentHistory(days);
    }
    async getCurrentDeploymentStatus(environment) {
        const tasks = await this.deploymentRepository.getDeploymentTasks(environment);
        if (tasks.length === 0) {
            return DeploymentConfig_1.DeploymentStatus.PENDING;
        }
        const latestTask = tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        return latestTask.status;
    }
    async getDeploymentStatistics(environment) {
        const tasks = await this.deploymentRepository.getDeploymentTasks(environment);
        const history = await this.deploymentRepository.getDeploymentHistory(environment);
        const artifacts = await this.deploymentRepository.getDeploymentArtifacts();
        const totalDeployments = history.length;
        const successfulDeployments = history.filter(h => h.status === DeploymentConfig_1.DeploymentStatus.SUCCESS).length;
        const failedDeployments = history.filter(h => h.status === DeploymentConfig_1.DeploymentStatus.FAILURE).length;
        const rolledBackDeployments = history.filter(h => h.status === DeploymentConfig_1.DeploymentStatus.ROLLED_BACK).length;
        const avgDeploymentTime = totalDeployments > 0
            ? history.reduce((sum, h) => sum + h.duration, 0) / totalDeployments
            : 0;
        const deploymentStatus = await this.getCurrentDeploymentStatus(environment);
        return {
            environment,
            totalDeployments,
            successfulDeployments,
            failedDeployments,
            rolledBackDeployments,
            avgDeploymentTime,
            deploymentStatus,
            totalArtifacts: artifacts.length,
            activeTasks: tasks.filter(t => t.status === DeploymentConfig_1.DeploymentStatus.IN_PROGRESS).length
        };
    }
}
exports.DeploymentServiceImpl = DeploymentServiceImpl;
//# sourceMappingURL=DeploymentServiceImpl.js.map