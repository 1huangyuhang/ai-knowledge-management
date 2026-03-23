/**
 * 数据库连接管理
 * 用于初始化和管理数据库连接
 */
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDatabaseConfig, SQLiteConfig, PostgreSQLConfig } from '../config/database-config';
import fs from 'fs';
import path from 'path';

/**
 * 数据库连接管理类
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private dataSource: DataSource | null = null;
  private initialized: boolean = false;

  /**
   * 私有构造函数，防止外部实例化
   */
  private constructor() {}

  /**
   * 获取单例实例
   * @returns 数据库连接管理实例
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * 类型守卫：检查是否为SQLite配置
   * @param config 数据库配置
   * @returns 是否为SQLite配置
   */
  private isSQLiteConfig(config: any): config is SQLiteConfig {
    return config.type === 'sqlite';
  }

  /**
   * 类型守卫：检查是否为PostgreSQL配置
   * @param config 数据库配置
   * @returns 是否为PostgreSQL配置
   */
  private isPostgreSQLConfig(config: any): config is PostgreSQLConfig {
    return config.type === 'postgresql';
  }

  /**
   * 确保数据库目录存在
   * @param databasePath 数据库文件路径
   */
  private ensureDatabaseDirectory(databasePath: string): void {
    const dirPath = path.dirname(databasePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created database directory: ${dirPath}`);
    }
  }

  /**
   * 初始化数据库连接
   * @returns 初始化后的DataSource实例
   */
  public async initialize(): Promise<DataSource> {
    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource;
    }

    try {
      const config = getDatabaseConfig();
      let options: DataSourceOptions;

      if (this.isSQLiteConfig(config)) {
        // 确保SQLite数据库目录存在
        this.ensureDatabaseDirectory(config.database);
        
        options = {
          type: 'sqlite',
          database: config.database,
          entities: [__dirname + '/entities/*.{ts,js}'],
          synchronize: config.synchronize,
          logging: config.logging,
          poolSize: 5, // SQLite连接池大小
          maxQueryExecutionTime: 10000, // 最大查询执行时间（毫秒）
          foreignKeys: true, // 启用外键约束
        };
      } else if (this.isPostgreSQLConfig(config)) {
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
          poolSize: 10, // PostgreSQL连接池大小
          maxQueryExecutionTime: 10000, // 最大查询执行时间（毫秒）
          connectTimeoutMS: 5000, // 连接超时时间（毫秒）
          keepConnectionAlive: true, // 保持连接活跃
        };
      } else {
        throw new Error(`Unsupported database type: ${(config as any).type}`);
      }

      this.dataSource = new DataSource(options);
      await this.dataSource.initialize();
      this.initialized = true;
      console.log('Database connection initialized successfully');
      return this.dataSource;
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取数据库连接
   * @returns DataSource实例
   */
  public getConnection(): DataSource | null {
    return this.dataSource;
  }

  /**
   * 检查数据库连接是否可用
   * @returns 连接是否可用
   */
  public isConnected(): boolean {
    return this.dataSource !== null && this.dataSource.isInitialized;
  }

  /**
   * 数据库健康检查
   * @returns 健康检查结果
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.dataSource || !this.dataSource.isInitialized) {
        return false;
      }

      // 执行简单的查询检查连接
      if (this.dataSource.driver.options.type === 'sqlite') {
        await this.dataSource.query('SELECT 1');
      } else {
        await this.dataSource.query('SELECT 1');
      }
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        this.dataSource = null;
        this.initialized = false;
        // 移除日志输出，避免测试环境中write EPIPE错误
        // console.log('Database connection closed successfully');
      } catch (error) {
        // 移除日志输出，避免测试环境中write EPIPE错误
        // console.error('Failed to close database connection:', error);
        throw new Error(`Failed to close database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * 重新连接数据库
   */
  public async reconnect(): Promise<DataSource> {
    try {
      // 关闭现有连接
      if (this.dataSource) {
        await this.close();
      }
      
      // 重新初始化连接
      return await this.initialize();
    } catch (error) {
      console.error('Failed to reconnect to database:', error);
      throw new Error(`Database reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取数据库状态信息
   * @returns 数据库状态信息
   */
  public getStatus(): {
    initialized: boolean;
    connected: boolean;
    databaseType: string | null;
    databaseName: string | null;
  } {
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

/**
 * 数据库连接实例
 */
export const databaseConnection = DatabaseConnection.getInstance();
