import { DatabaseClient } from '../database/database-connection';
import { EventSystem } from '../events/event-bus';
import { LoggerService } from '../logging/logger.service';
import { ErrorHandler } from '../error/error-handler';
import { ConfigManager } from './ConfigManager';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { HealthChecker } from '../monitoring/HealthChecker';
import { ModuleRegistry } from './ModuleRegistry';
import { DataFlowManager } from './DataFlowManager';
export interface SystemIntegratorConfig {
    configPath?: string;
    environment?: string;
}
export interface SystemComponents {
    databaseClient: DatabaseClient;
    eventSystem: EventSystem;
    loggingSystem: LoggerService;
    errorHandler: ErrorHandler;
    configManager: ConfigManager;
    systemMonitor: SystemMonitor;
    healthChecker: HealthChecker;
    moduleRegistry: ModuleRegistry;
    dataFlowManager: DataFlowManager;
}
export declare class SystemIntegrator {
    private config;
    private components;
    private isInitialized;
    constructor(config?: SystemIntegratorConfig);
    initialize(): Promise<SystemComponents>;
    shutdown(): Promise<void>;
    getComponents(): Partial<SystemComponents>;
    getIsInitialized(): boolean;
}
//# sourceMappingURL=SystemIntegrator.d.ts.map