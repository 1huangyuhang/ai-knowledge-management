export interface DependencyContainer {
    register<T>(key: string, factory: () => T): void;
    registerSingleton<T>(key: string, factory: () => T): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
    clear(): void;
}
export declare class SimpleDependencyContainer implements DependencyContainer {
    private readonly dependencies;
    private readonly singletonInstances;
    register<T>(key: string, factory: () => T): void;
    registerSingleton<T>(key: string, factory: () => T): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
    clear(): void;
}
export declare const globalContainer: SimpleDependencyContainer;
//# sourceMappingURL=DependencyContainer.d.ts.map