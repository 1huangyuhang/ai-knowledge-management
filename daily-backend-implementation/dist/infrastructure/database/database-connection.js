"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConnection = exports.DatabaseConnection = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database-config");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
class DatabaseConnection {
    static instance;
    dataSource = null;
    initialized = false;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    isSQLiteConfig(config) {
        return config.type === 'sqlite';
    }
    isPostgreSQLConfig(config) {
        return config.type === 'postgresql';
    }
    ensureDatabaseDirectory(databasePath) {
        const dirPath = path_1.default.dirname(databasePath);
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
            console.log(`Created database directory: ${dirPath}`);
        }
    }
    async initialize() {
        if (this.dataSource && this.dataSource.isInitialized) {
            return this.dataSource;
        }
        try {
            const config = (0, database_config_1.getDatabaseConfig)();
            let options;
            if (this.isSQLiteConfig(config)) {
                this.ensureDatabaseDirectory(config.database);
                options = {
                    type: 'sqlite',
                    database: config.database,
                    entities: [__dirname + '/entities/*.{ts,js}'],
                    synchronize: config.synchronize,
                    logging: config.logging,
                    poolSize: 5,
                    maxQueryExecutionTime: 10000,
                    foreignKeys: true,
                };
            }
            else if (this.isPostgreSQLConfig(config)) {
                options = {
                    type: 'postgres',
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    database: config.dbName,
                    entities: [__dirname + '/entities/*.{ts,js}'],
                    synchronize: config.synchronize,
                    logging: config.logging,
                    poolSize: 10,
                    maxQueryExecutionTime: 10000,
                    connectTimeoutMS: 5000,
                    keepConnectionAlive: true,
                };
            }
            else {
                throw new Error(`Unsupported database type: ${config.type}`);
            }
            this.dataSource = new typeorm_1.DataSource(options);
            await this.dataSource.initialize();
            this.initialized = true;
            console.log('Database connection initialized successfully');
            return this.dataSource;
        }
        catch (error) {
            console.error('Failed to initialize database connection:', error);
            throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getConnection() {
        return this.dataSource;
    }
    isConnected() {
        return this.dataSource !== null && this.dataSource.isInitialized;
    }
    async healthCheck() {
        try {
            if (!this.dataSource || !this.dataSource.isInitialized) {
                return false;
            }
            if (this.dataSource.driver.options.type === 'sqlite') {
                await this.dataSource.query('SELECT 1');
            }
            else {
                await this.dataSource.query('SELECT 1');
            }
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
    async close() {
        if (this.dataSource && this.dataSource.isInitialized) {
            try {
                await this.dataSource.destroy();
                this.dataSource = null;
                this.initialized = false;
            }
            catch (error) {
                throw new Error(`Failed to close database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    async reconnect() {
        try {
            if (this.dataSource) {
                await this.close();
            }
            return await this.initialize();
        }
        catch (error) {
            console.error('Failed to reconnect to database:', error);
            throw new Error(`Database reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getStatus() {
        return {
            initialized: this.initialized,
            connected: this.isConnected(),
            databaseType: this.dataSource?.driver.options.type || null,
            databaseName: this.isSQLiteConfig(this.dataSource?.driver.options || {})
                ? this.dataSource?.driver.options.database || null
                : this.dataSource?.driver.options.database || null,
        };
    }
}
exports.DatabaseConnection = DatabaseConnection;
exports.databaseConnection = DatabaseConnection.getInstance();
//# sourceMappingURL=database-connection.js.map