import { FastifyInstance } from 'fastify';
export declare class DIContainer {
    private registry;
    private instances;
    register<T>(key: string, factory: () => T, isSingleton?: boolean): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
    remove(key: string): void;
    clear(): void;
    getRegisteredKeys(): string[];
}
export declare const container: DIContainer;
export declare function configureDI(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=container.d.ts.map