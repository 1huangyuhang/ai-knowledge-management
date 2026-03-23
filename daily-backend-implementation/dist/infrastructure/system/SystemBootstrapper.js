"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemBootstrapper = void 0;
const SystemIntegrator_1 = require("./SystemIntegrator");
class SystemBootstrapper {
    config;
    systemIntegrator;
    loggingSystem = null;
    constructor(config = {}) {
        this.config = {
            environment: process.env.NODE_ENV || 'development',
            configPath: './config',
            port: parseInt(process.env.PORT || '3000'),
            enableGracefulShutdown: true,
            enableHealthCheck: true,
            enableMetrics: true,
            ...config,
        };
        this.systemIntegrator = new SystemIntegrator_1.SystemIntegrator({
            configPath: this.config.configPath,
            environment: this.config.environment,
        });
    }
    async start() {
        try {
            const components = await this.systemIntegrator.initialize();
            this.loggingSystem = components.loggingSystem;
            this.loggingSystem.info('System initialization completed successfully');
            const port = this.config.port || 3000;
            const { ExpressApp } = await Promise.resolve().then(() => __importStar(require('../../application/ExpressApp')));
            const expressApp = new ExpressApp({
                components,
                port,
            });
            expressApp.start();
            this.loggingSystem.info(`Express application started on port ${port}`);
            if (this.config.enableGracefulShutdown) {
                this.configureGracefulShutdown();
            }
            this.loggingSystem.info('System startup completed successfully');
        }
        catch (error) {
            if (this.loggingSystem) {
                this.loggingSystem.error('Failed to start system', error);
            }
            else {
                console.error('Failed to start system:', error);
            }
            await this.shutdown();
            process.exit(1);
        }
    }
    configureGracefulShutdown() {
        const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                this.loggingSystem?.info(`Received ${signal} signal, shutting down gracefully...`);
                await this.shutdown();
                process.exit(0);
            });
        });
    }
    async shutdown() {
        this.loggingSystem?.info('Shutting down system...');
        try {
            await this.systemIntegrator.shutdown();
            this.loggingSystem?.info('System shutdown completed successfully');
        }
        catch (error) {
            this.loggingSystem?.error('Error during system shutdown', error);
            console.error('Error during system shutdown:', error);
        }
    }
    getSystemIntegrator() {
        return this.systemIntegrator;
    }
}
exports.SystemBootstrapper = SystemBootstrapper;
//# sourceMappingURL=SystemBootstrapper.js.map