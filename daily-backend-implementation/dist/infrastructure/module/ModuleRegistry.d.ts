export declare enum ModuleStatus {
    INITIALIZING = "INITIALIZING",
    RUNNING = "RUNNING",
    STOPPED = "STOPPED",
    ERROR = "ERROR"
}
export interface ModuleInfo {
    id: string;
    name: string;
    version: string;
    dependencies: string[];
    healthCheckUrl: string;
    apiEndpoints: string[];
    status: ModuleStatus;
    description?: string;
}
export interface ModuleRegistry {
    registerModule(module: ModuleInfo): Promise<boolean>;
    unregisterModule(moduleId: string): Promise<boolean>;
    getModule(moduleId: string): Promise<ModuleInfo | null>;
    getAllModules(): Promise<ModuleInfo[]>;
    isModuleAvailable(moduleId: string): Promise<boolean>;
    updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean>;
    validateModuleDependencies(moduleId: string): Promise<boolean>;
}
export declare class InMemoryModuleRegistry implements ModuleRegistry {
    private modules;
    registerModule(module: ModuleInfo): Promise<boolean>;
    unregisterModule(moduleId: string): Promise<boolean>;
    getModule(moduleId: string): Promise<ModuleInfo | null>;
    getAllModules(): Promise<ModuleInfo[]>;
    isModuleAvailable(moduleId: string): Promise<boolean>;
    updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean>;
    validateModuleDependencies(moduleId: string): Promise<boolean>;
}
export declare const moduleRegistry: InMemoryModuleRegistry;
//# sourceMappingURL=ModuleRegistry.d.ts.map