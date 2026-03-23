/**
 * 日志服务接口
 * 定义日志记录的标准接口
 */
export interface LoggerService {
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  debug(message: string, metadata?: Record<string, any>): void;

  /**
   * 记录信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  info(message: string, metadata?: Record<string, any>): void;

  /**
   * 记录警告
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  warn(message: string, metadata?: Record<string, any>): void;

  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param metadata 附加元数据
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void;

  /**
   * 记录致命错误
   * @param message 日志消息
   * @param error 错误对象
   * @param metadata 附加元数据
   */
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void;
}
