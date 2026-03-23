import { ModuleRegistry, ModuleInfo } from '../../infrastructure/module/ModuleRegistry';
import { HealthChecker, HealthIndicator, HealthStatusType } from '../../infrastructure/health/HealthChecker';
import { EventBus } from '../../infrastructure/events/event-bus';
import { LoggerService } from '../../infrastructure/logging/logger.service';
export interface ModuleIntegrationService {
    integrateModules(): Promise<void>;
    registerModule(moduleInfo: ModuleInfo): Promise<void>;
    registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
    getIntegrationStatus(): Promise<Record<string, any>>;
}
export declare class DefaultHealthIndicator implements HealthIndicator {
    moduleId: string;
    private logger;
    constructor(moduleId: string, logger: LoggerService);
    check(): Promise<{
        status: HealthStatusType;
        details?: Record<string, any> | undefined;
        error?: string | undefined;
    }>;
}
export declare class ModuleIntegrationServiceImpl implements ModuleIntegrationService {
    private moduleRegistry;
    private healthChecker;
    private eventBus;
    private logger;
    constructor(moduleRegistry: ModuleRegistry, healthChecker: HealthChecker, eventBus: EventBus, logger: LoggerService);
    integrateModules(): Promise<void>;
    registerModule(moduleInfo: ModuleInfo): Promise<void>;
    registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
    getIntegrationStatus(): Promise<Record<string, any>>;
}
//# sourceMappingURL=ModuleIntegrationService.d.ts.map