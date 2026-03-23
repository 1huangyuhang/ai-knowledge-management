"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemIntegrator = void 0;
const database_connection_1 = require("../database/database-connection");
const event_bus_1 = require("../events/event-bus");
const ConfigManager_1 = require("./ConfigManager");
const SystemMonitor_1 = require("../monitoring/SystemMonitor");
const DependencyConfig_1 = require("../dependency-injection/DependencyConfig");
const pino_logger_service_1 = require("../logging/pino-logger.service");
const HealthChecker_1 = require("../monitoring/HealthChecker");
const ModuleRegistry_1 = require("./ModuleRegistry");
const DataFlowManager_1 = require("./DataFlowManager");
class SystemIntegrator {
    config;
    components = {};
    isInitialized = false;
    constructor(config = {}) {
        this.config = {
            environment: process.env.NODE_ENV || 'development',
            configPath: './config',
            ...config,
        };
    }
    async initialize() {
        if (this.isInitialized) {
            return this.components;
        }
        try {
            this.components.configManager = new ConfigManager_1.ConfigManager({
                configPath: this.config.configPath,
                environment: this.config.environment,
            });
            await this.components.configManager.load();
            const logLevel = this.components.configManager.get('LOG_LEVEL', 'info');
            const logFormat = this.components.configManager.get('LOG_FORMAT', 'json');
            this.components.loggingSystem = new pino_logger_service_1.PinoLoggerService({ logLevel, logFormat });
            this.components.loggingSystem.info('Logging system initialized');
            this.components.errorHandler = new error_handler_1.ErrorHandler(this.components.loggingSystem);
            this.components.loggingSystem.info('Error handling system initialized');
            this.components.eventSystem = new event_bus_1.EventSystem();
            this.components.loggingSystem.info('Event system initialized');
            const databaseUrl = this.components.configManager.get('DATABASE_URL', ':memory:');
            this.components.databaseClient = new database_connection_1.DatabaseClient(databaseUrl);
            await this.components.databaseClient.connect();
            await this.components.databaseClient.initializeTables();
            this.components.loggingSystem.info('Database client initialized');
            this.components.systemMonitor = new SystemMonitor_1.SystemMonitor(this.components.loggingSystem, this.components.databaseClient, this.components.eventSystem);
            this.components.loggingSystem.info('System monitor initialized');
            this.components.moduleRegistry = ModuleRegistry_1.moduleRegistry;
            this.components.loggingSystem.info('Module registry initialized');
            this.components.healthChecker = HealthChecker_1.healthChecker;
            this.components.loggingSystem.info('Health checker initialized');
            this.components.dataFlowManager = DataFlowManager_1.dataFlowManager;
            this.components.loggingSystem.info('Data flow manager initialized');
            (0, DependencyConfig_1.configureDependencyInjection)(this.components.configManager, this.components.loggingSystem);
            this.components.loggingSystem.info('Dependency injection configured');
            process.on('uncaughtException', (error) => {
                this.components.errorHandler.handle(error, { context: 'global-uncaught-exception' });
                process.exit(1);
            });
            process.on('unhandledRejection', (reason) => {
                const error = reason instanceof Error ? reason : new Error(String(reason));
                this.components.errorHandler.handle(error, { context: 'global-unhandled-rejection' });
            });
            this.isInitialized = true;
            this.components.loggingSystem.info('System initialized successfully');
            return this.components;
        }
        catch (error) {
            await this.shutdown();
            throw error;
        }
    }
    async shutdown() {
        const loggingSystem = this.components.loggingSystem;
        if (this.components.databaseClient) {
            try {
                await this.components.databaseClient.disconnect();
                loggingSystem?.info('Database client disconnected');
            }
            catch (error) {
                loggingSystem?.error('Error disconnecting database client', error);
            }
        }
        if (this.components.eventSystem) {
            try {
                await this.components.eventSystem.shutdown();
                loggingSystem?.info('Event system shut down');
            }
            catch (error) {
                loggingSystem?.error('Error shutting down event system', error);
            }
        }
        if (this.components.loggingSystem) {
            try {
                await this.components.loggingSystem.shutdown();
            }
            catch (error) {
                console.error('Error shutting down logging system:', error);
            }
        }
        this.isInitialized = false;
        this.components = {};
    }
    getComponents() {
        return this.components;
    }
    getIsInitialized() {
        return this.isInitialized;
    }
}
exports.SystemIntegrator = SystemIntegrator;
//# sourceMappingURL=SystemIntegrator.js.map