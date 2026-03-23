# Day 18: 日志系统 - 代码实现文档（第一部分）

## 1. 当日主题概述

### 1.1 核心开发目标
- 实现完善的日志系统
- 支持多种日志输出目标
- 实现日志级别和过滤机制
- 支持结构化日志
- 实现日志轮转功能
- 考虑日志性能
- 编写全面的测试

### 1.2 技术要点
- 日志设计模式
- 结构化日志
- 日志级别
- 日志输出目标
- 日志轮转
- 性能优化

## 2. 日志系统设计

### 2.1 扩展日志接口

```typescript
// src/application/interfaces/logging/Logger.ts

export interface Logger {
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  debug(message: string, context?: Record<string, any>): void;
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  info(message: string, context?: Record<string, any>): void;
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  warn(message: string, context?: Record<string, any>): void;
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  error(message: string, error?: Error, context?: Record<string, any>): void;
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void;
  
  /**
   * 获取当前日志级别
   * @returns 当前日志级别
   */
  getLevel(): LogLevel;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
  [key: string]: any;
}

export interface LogFormatter {
  /**
   * 格式化日志记录
   * @param record 日志记录
   * @returns 格式化后的日志字符串
   */
  format(record: LogRecord): string;
}

export interface LogAppender {
  /**
   * 输出日志记录
   * @param record 日志记录
   */
  append(record: LogRecord): void;
  
  /**
   * 关闭日志输出器
   */
  close(): void;
}
```

### 2.2 日志格式化器实现

```typescript
// src/infrastructure/logging/formatters/JsonFormatter.ts

import { LogFormatter, LogRecord } from '../../../application/interfaces/logging/Logger';

export class JsonFormatter implements LogFormatter {
  /**
   * 格式化日志记录为JSON字符串
   * @param record 日志记录
   * @returns 格式化后的日志字符串
   */
  public format(record: LogRecord): string {
    return JSON.stringify(record);
  }
}

// src/infrastructure/logging/formatters/TextFormatter.ts

import { LogFormatter, LogRecord } from '../../../application/interfaces/logging/Logger';

export class TextFormatter implements LogFormatter {
  /**
   * 格式化日志记录为文本字符串
   * @param record 日志记录
   * @returns 格式化后的日志字符串
   */
  public format(record: LogRecord): string {
    const { timestamp, level, message, context, error } = record;
    let logLine = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      logLine += ` ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logLine += ` Error: ${error.message}`;
      if (error.stack) {
        logLine += `\n${error.stack}`;
      }
    }
    
    return logLine;
  }
}
```

### 2.3 日志输出器实现

```typescript
// src/infrastructure/logging/appenders/ConsoleAppender.ts

import { LogAppender, LogRecord } from '../../../application/interfaces/logging/Logger';
import { LogFormatter } from '../../../application/interfaces/logging/Logger';
import { JsonFormatter } from '../formatters/JsonFormatter';

export class ConsoleAppender implements LogAppender {
  private readonly formatter: LogFormatter;
  
  /**
   * 创建控制台日志输出器实例
   * @param formatter 日志格式化器
   */
  constructor(formatter: LogFormatter = new JsonFormatter()) {
    this.formatter = formatter;
  }
  
  /**
   * 输出日志记录到控制台
   * @param record 日志记录
   */
  public append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record);
    
    switch (record.level) {
      case 'debug':
        console.debug(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }
  
  /**
   * 关闭日志输出器
   */
  public close(): void {
    // 控制台输出器不需要关闭
  }
}

// src/infrastructure/logging/appenders/FileAppender.ts

import { LogAppender, LogRecord } from '../../../application/interfaces/logging/Logger';
import { LogFormatter } from '../../../application/interfaces/logging/Logger';
import { JsonFormatter } from '../formatters/JsonFormatter';
import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

export class FileAppender implements LogAppender {
  private readonly formatter: LogFormatter;
  private readonly stream: WriteStream;
  private readonly filePath: string;
  
  /**
   * 创建文件日志输出器实例
   * @param logDir 日志目录
   * @param fileName 日志文件名
   * @param formatter 日志格式化器
   */
  constructor(
    logDir: string = './logs',
    fileName: string = 'application.log',
    formatter: LogFormatter = new JsonFormatter()
  ) {
    this.formatter = formatter;
    this.filePath = join(logDir, fileName);
    
    // 创建写入流，追加模式
    this.stream = createWriteStream(this.filePath, { flags: 'a' });
  }
  
  /**
   * 输出日志记录到文件
   * @param record 日志记录
   */
  public append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record) + '\n';
    this.stream.write(formattedLog);
  }
  
  /**
   * 关闭日志输出器
   */
  public close(): void {
    this.stream.end();
  }
  
  /**
   * 获取日志文件路径
   * @returns 日志文件路径
   */
  public getFilePath(): string {
    return this.filePath;
  }
}
```

### 2.4 日志轮转实现

```typescript
// src/infrastructure/logging/appenders/RotatingFileAppender.ts

import { LogAppender, LogRecord } from '../../../application/interfaces/logging/Logger';
import { LogFormatter } from '../../../application/interfaces/logging/Logger';
import { JsonFormatter } from '../formatters/JsonFormatter';
import { createWriteStream, WriteStream, statSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface RotatingFileAppenderOptions {
  logDir?: string;
  fileName?: string;
  formatter?: LogFormatter;
  maxFileSize?: number; // 最大文件大小（字节）
  maxFiles?: number; // 最大保留文件数
}

export class RotatingFileAppender implements LogAppender {
  private readonly formatter: LogFormatter;
  private stream: WriteStream;
  private readonly logDir: string;
  private readonly baseFileName: string;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private currentFileIndex: number = 0;
  private currentFilePath: string;
  
  /**
   * 创建轮转文件日志输出器实例
   * @param options 配置选项
   */
  constructor(options: RotatingFileAppenderOptions = {}) {
    this.formatter = options.formatter || new JsonFormatter();
    this.logDir = options.logDir || './logs';
    this.baseFileName = options.fileName || 'application.log';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 默认10MB
    this.maxFiles = options.maxFiles || 5; // 默认保留5个文件
    
    // 确保日志目录存在
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
    
    this.currentFilePath = this.getFilePath(this.currentFileIndex);
    this.stream = createWriteStream(this.currentFilePath, { flags: 'a' });
  }
  
  /**
   * 输出日志记录到文件
   * @param record 日志记录
   */
  public append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record) + '\n';
    
    // 检查文件大小，如果超过最大值则轮转
    if (this.shouldRotate()) {
      this.rotate();
    }
    
    this.stream.write(formattedLog);
  }
  
  /**
   * 关闭日志输出器
   */
  public close(): void {
    this.stream.end();
  }
  
  /**
   * 检查是否需要轮转日志文件
   * @returns 是否需要轮转
   */
  private shouldRotate(): boolean {
    try {
      const stats = statSync(this.currentFilePath);
      return stats.size >= this.maxFileSize;
    } catch (error) {
      // 文件不存在或其他错误，不需要轮转
      return false;
    }
  }
  
  /**
   * 执行日志轮转
   */
  private rotate(): void {
    // 关闭当前流
    this.stream.end();
    
    // 递增文件索引
    this.currentFileIndex++;
    
    // 如果超过最大文件数，重置索引
    if (this.currentFileIndex >= this.maxFiles) {
      this.currentFileIndex = 0;
    }
    
    // 创建新的文件路径和流
    this.currentFilePath = this.getFilePath(this.currentFileIndex);
    this.stream = createWriteStream(this.currentFilePath, { flags: 'w' }); // 覆盖模式
  }
  
  /**
   * 获取带索引的日志文件路径
   * @param index 文件索引
   * @returns 日志文件路径
   */
  private getFilePath(index: number): string {
    if (index === 0) {
      return join(this.logDir, this.baseFileName);
    }
    
    const extension = this.baseFileName.split('.').pop() || 'log';
    const baseName = this.baseFileName.replace(`.${extension}`, '');
    return join(this.logDir, `${baseName}.${index}.${extension}`);
  }
}
```

### 2.5 日志管理器实现

```typescript
// src/infrastructure/logging/LoggerManager.ts

import { Logger, LogLevel, LogRecord } from '../../application/interfaces/logging/Logger';
import { LogAppender } from '../../application/interfaces/logging/Logger';
import { ConsoleAppender } from './appenders/ConsoleAppender';
import { TextFormatter } from './formatters/TextFormatter';

export class LoggerImpl implements Logger {
  private level: LogLevel = LogLevel.INFO;
  private readonly appenders: LogAppender[] = [];
  private readonly context: Record<string, any> = {};
  private readonly name: string;
  
  /**
   * 创建日志管理器实例
   * @param name 日志名称
   */
  constructor(name: string = 'application') {
    this.name = name;
    
    // 默认添加控制台输出器
    this.addAppender(new ConsoleAppender(new TextFormatter()));
  }
  
  /**
   * 添加日志输出器
   * @param appender 日志输出器
   */
  public addAppender(appender: LogAppender): void {
    this.appenders.push(appender);
  }
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * 获取当前日志级别
   * @returns 当前日志级别
   */
  public getLevel(): LogLevel {
    return this.level;
  }
  
  /**
   * 设置全局上下文
   * @param context 上下文数据
   */
  public setContext(context: Record<string, any>): void {
    Object.assign(this.context, context);
  }
  
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const logContext = { ...context, error: this.formatError(error) };
    this.log(LogLevel.ERROR, message, logContext);
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param context 日志上下文
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }
    
    // 创建日志记录
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      name: this.name,
      context: { ...this.context, ...context }
    };
    
    // 输出到所有输出器
    for (const appender of this.appenders) {
      try {
        appender.append(record);
      } catch (error) {
        // 避免日志系统本身的错误影响应用
        console.error('Failed to append log:', error);
      }
    }
  }
  
  /**
   * 判断是否应该记录该级别的日志
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  /**
   * 格式化错误对象
   * @param error 错误对象
   * @returns 格式化后的错误信息
   */
  private formatError(error?: Error): any {
    if (!error) {
      return undefined;
    }
    
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  
  /**
   * 创建子日志器
   * @param name 子日志器名称
   * @returns 子日志器实例
   */
  public createChildLogger(name: string): LoggerImpl {
    const childLogger = new LoggerImpl(`${this.name}.${name}`);
    childLogger.setLevel(this.level);
    childLogger.setContext({ ...this.context });
    
    // 复制父日志器的输出器
    for (const appender of this.appenders) {
      childLogger.addAppender(appender);
    }
    
    return childLogger;
  }
}

// 日志管理器单例
let loggerInstance: LoggerImpl | null = null;

export const getLogger = (name?: string): LoggerImpl => {
  if (!loggerInstance) {
    loggerInstance = new LoggerImpl(name);
  }
  
  if (name && name !== loggerInstance!.name) {
    return loggerInstance.createChildLogger(name);
  }
  
  return loggerInstance;
};
```