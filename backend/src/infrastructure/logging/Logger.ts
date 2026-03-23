export interface Logger {
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  debug(message: string, metadata?: any): void;

  /**
   * 记录信息
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  info(message: string, metadata?: any): void;

  /**
   * 记录警告
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  warn(message: string, metadata?: any): void;

  /**
   * 记录错误
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  error(message: string, metadata?: any): void;

  /**
   * 记录致命错误
   * @param message 日志消息
   * @param metadata 附加元数据
   */
  fatal(message: string, metadata?: any): void;
}
