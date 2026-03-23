/**
 * Pino日志服务实现
 * 使用Pino库实现日志记录功能
 */
import pino from 'pino';
import { LoggerService } from './logger.service';

/**
 * Pino日志服务配置选项
 */
export interface PinoLoggerConfig {
  /**
   * 日志级别
   */
  level: string;
  /**
   * 是否启用彩色日志
   */
  prettyPrint: boolean;
}

/**
 * Pino日志服务实现类
 */
export class PinoLoggerService implements LoggerService {
  private logger: pino.Logger;

  /**
   * 创建PinoLoggerService实例
   * @param config Pino日志配置
   */
  constructor(config: PinoLoggerConfig = { level: 'info', prettyPrint: true }) {
    // 检查是否在测试环境中，测试环境中禁用prettyPrint
    const isTest = process.env.NODE_ENV === 'test';
    const shouldPrettyPrint = config.prettyPrint && !isTest;
    
    const pinoOptions: pino.LoggerOptions = {
      level: config.level,
      ...(shouldPrettyPrint
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    };

    this.logger = pino(pinoOptions);
  }

  /**
   * 记录调试信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  debug(message: string, metadata?: Record<string, any>): void {
    if (metadata) {
      this.logger.debug(metadata, message);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * 记录信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  info(message: string, metadata?: Record<string, any>): void {
    if (metadata) {
      this.logger.info(metadata, message);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * 记录警告
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  warn(message: string, metadata?: Record<string, any>): void {
    if (metadata) {
      this.logger.warn(metadata, message);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param metadata 附加元数据
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (error) {
      this.logger.error(
        {
          ...metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        },
        message
      );
    } else if (metadata) {
      this.logger.error(metadata, message);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * 记录致命错误
   * @param message 日志消息
   * @param error 错误对象
   * @param metadata 附加元数据
   */
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (error) {
      this.logger.fatal(
        {
          ...metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        },
        message
      );
    } else if (metadata) {
      this.logger.fatal(metadata, message);
    } else {
      this.logger.fatal(message);
    }
  }
}
