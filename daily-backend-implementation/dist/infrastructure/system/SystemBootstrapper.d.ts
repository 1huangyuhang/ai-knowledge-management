import { SystemIntegrator } from './SystemIntegrator';
export interface SystemBootstrapperConfig {
    configPath?: string;
    environment?: string;
    port?: number;
    enableGracefulShutdown?: boolean;
    enableHealthCheck?: boolean;
    enableMetrics?: boolean;
}
export declare class SystemBootstrapper {
    private readonly config;
    private systemIntegrator;
    private loggingSystem;
    constructor(config?: SystemBootstrapperConfig);
    start(): Promise<void>;
    private configureGracefulShutdown;
    shutdown(): Promise<void>;
    getSystemIntegrator(): SystemIntegrator;
}
//# sourceMappingURL=SystemBootstrapper.d.ts.map