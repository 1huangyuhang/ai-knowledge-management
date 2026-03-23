import { DatabaseClient } from '../infrastructure/database/connection/sqlite.connection';
export declare class ResourceManager {
    private createdResources;
    private databaseClient;
    constructor(databaseClient: DatabaseClient);
    registerCleanup(cleanupFn: () => Promise<void>): void;
    cleanup(): Promise<void>;
    cleanupTable(tableName: string): Promise<void>;
    cleanupAllTables(): Promise<void>;
}
//# sourceMappingURL=resource-manager.d.ts.map