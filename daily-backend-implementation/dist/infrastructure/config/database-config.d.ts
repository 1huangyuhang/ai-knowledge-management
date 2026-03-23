export interface SQLiteConfig {
    type: 'sqlite';
    database: string;
    logging: boolean;
    synchronize: boolean;
}
export interface PostgreSQLConfig {
    type: 'postgresql';
    host: string;
    port: number;
    username: string;
    password: string;
    dbName: string;
    logging: boolean;
    synchronize: boolean;
}
export type DatabaseConfig = SQLiteConfig | PostgreSQLConfig;
export declare function getDatabaseConfig(): DatabaseConfig;
//# sourceMappingURL=database-config.d.ts.map