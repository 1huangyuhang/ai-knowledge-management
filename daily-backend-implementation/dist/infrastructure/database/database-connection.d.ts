import 'reflect-metadata';
import { DataSource } from 'typeorm';
export declare class DatabaseConnection {
    private static instance;
    private dataSource;
    private initialized;
    private constructor();
    static getInstance(): DatabaseConnection;
    private isSQLiteConfig;
    private isPostgreSQLConfig;
    private ensureDatabaseDirectory;
    initialize(): Promise<DataSource>;
    getConnection(): DataSource | null;
    isConnected(): boolean;
    healthCheck(): Promise<boolean>;
    close(): Promise<void>;
    reconnect(): Promise<DataSource>;
    getStatus(): {
        initialized: boolean;
        connected: boolean;
        databaseType: string | null;
        databaseName: string | null;
    };
}
export declare const databaseConnection: DatabaseConnection;
//# sourceMappingURL=database-connection.d.ts.map