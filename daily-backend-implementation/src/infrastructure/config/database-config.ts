/**
 * 数据库配置
 * 用于管理数据库连接的配置信息
 */

/**
 * SQLite数据库配置
 */
export interface SQLiteConfig {
  type: 'sqlite';
  database: string;
  logging: boolean;
  synchronize: boolean;
}

/**
 * PostgreSQL数据库配置
 */
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

/**
 * 数据库配置联合类型
 */
export type DatabaseConfig = SQLiteConfig | PostgreSQLConfig;

/**
 * 获取数据库配置
 * @returns 数据库配置对象
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    type: 'sqlite',
    database: './data/database.sqlite',
    logging: true,
    synchronize: true
  };
}
