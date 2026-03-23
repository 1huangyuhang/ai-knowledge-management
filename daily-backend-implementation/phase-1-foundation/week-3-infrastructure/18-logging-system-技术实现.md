# Day 18: 日志系统代码实现

## 核心设计

### 设计原则

- **高内聚、低耦合**：日志系统各组件（日志器、输出器、格式化器）之间通过接口通信，便于扩展和替换
- **可扩展性**：支持多种输出目标和格式化方式，可通过配置动态切换
- **高性能**：采用异步日志写入，避免阻塞主线程
- **可配置性**：支持通过配置文件或代码调整日志级别、输出格式和目标
- **完整性**：包含完整的日志记录信息（时间、级别、消息、上下文、堆栈跟踪）

### 核心组件

1. **Logger**：日志记录器，提供不同级别的日志记录方法
2. **LogAppender**：日志输出器，负责将日志记录输出到不同目标
3. **LogFormatter**：日志格式化器，负责将日志记录格式化为特定格式
4. **LogManager**：日志管理器，负责创建和配置日志器
5. **LogRecord**：日志记录对象，包含日志的所有信息

## 实现细节

### 1. 核心接口定义

```typescript
// 日志级别枚举
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

// 日志记录对象
export interface LogRecord {
  timestamp: Date;
  level: LogLevel;
  loggerName: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

// 日志格式化器接口
export interface LogFormatter {
  format(record: LogRecord): string;
}

// 日志输出器接口
export interface LogAppender {
  append(record: LogRecord): void;
  close(): void;
}

// 日志配置接口
export interface LoggerConfig {
  level: LogLevel;
  appenders: LogAppender[];
  formatter: LogFormatter;
}

// 日志器接口
export interface Logger {
  trace(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
}

// 日志管理器接口
export interface LogManager {
  getLogger(name: string): Logger;
  shutdown(): void;
}
```

### 2. 日志格式化器实现

```typescript
// 文本格式化器
export class TextFormatter implements LogFormatter {
  /**
   * 将日志记录格式化为文本格式
   * @param record 日志记录对象
   * @returns 格式化后的文本日志
   */
  format(record: LogRecord): string {
    const levelName = LogLevel[record.level];
    const timestamp = record.timestamp.toISOString();
    let logMsg = `${timestamp} [${levelName}] ${record.loggerName}: ${record.message}`;
    
    // 添加上下文信息
    if (record.context) {
      logMsg += ` ${JSON.stringify(record.context)}`;
    }
    
    // 添加错误信息和堆栈跟踪
    if (record.error) {
      logMsg += `\nError: ${record.error.message}`;
      if (record.error.stack) {
        logMsg += `\nStack Trace: ${record.error.stack}`;
      }
    }
    
    return logMsg;
  }
}

// JSON格式化器
export class JsonFormatter implements LogFormatter {
  /**
   * 将日志记录格式化为JSON格式
   * @param record 日志记录对象
   * @returns 格式化后的JSON日志
   */
  format(record: LogRecord): string {
    const logObj = {
      timestamp: record.timestamp.toISOString(),
      level: LogLevel[record.level],
      loggerName: record.loggerName,
      message: record.message,
      context: record.context,
      error: record.error ? {
        message: record.error.message,
        stack: record.error.stack
      } : undefined
    };
    
    return JSON.stringify(logObj);
  }
}
```

### 3. 日志输出器实现

```typescript
// 控制台输出器
export class ConsoleAppender implements LogAppender {
  private formatter: LogFormatter;
  
  /**
   * 控制台输出器构造函数
   * @param formatter 日志格式化器
   */
  constructor(formatter: LogFormatter) {
    this.formatter = formatter;
  }
  
  /**
   * 将日志记录输出到控制台
   * @param record 日志记录对象
   */
  append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record);
    
    // 根据日志级别选择不同的控制台输出方法
    switch (record.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog);
        break;
    }
  }
  
  /**
   * 关闭输出器
   */
  close(): void {
    // 控制台输出器无需关闭资源
  }
}

// 文件输出器
export class FileAppender implements LogAppender {
  private formatter: LogFormatter;
  private filePath: string;
  private fs: any;
  private stream: any;
  
  /**
   * 文件输出器构造函数
   * @param formatter 日志格式化器
   * @param filePath 日志文件路径
   */
  constructor(formatter: LogFormatter, filePath: string) {
    this.formatter = formatter;
    this.filePath = filePath;
    this.fs = require('fs');
    
    // 确保日志目录存在
    const dir = this.fs.dirname(this.filePath);
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdirSync(dir, { recursive: true });
    }
    
    // 打开文件流（追加模式）
    this.stream = this.fs.createWriteStream(this.filePath, { flags: 'a' });
  }
  
  /**
   * 将日志记录输出到文件
   * @param record 日志记录对象
   */
  append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record) + '\n';
    this.stream.write(formattedLog);
  }
  
  /**
   * 关闭输出器，释放资源
   */
  close(): void {
    if (this.stream) {
      this.stream.end();
    }
  }
}

// 轮转文件输出器
export class RotatingFileAppender implements LogAppender {
  private formatter: LogFormatter;
  private filePath: string;
  private maxFileSize: number;
  private maxFiles: number;
  private fs: any;
  private stream: any;
  private currentSize: number;
  
  /**
   * 轮转文件输出器构造函数
   * @param formatter 日志格式化器
   * @param filePath 日志文件路径
   * @param maxFileSize 单个日志文件最大大小（字节）
   * @param maxFiles 最大保留日志文件数量
   */
  constructor(formatter: LogFormatter, filePath: string, maxFileSize: number = 10 * 1024 * 1024, maxFiles: number = 5) {
    this.formatter = formatter;
    this.filePath = filePath;
    this.maxFileSize = maxFileSize;
    this.maxFiles = maxFiles;
    this.fs = require('fs');
    this.currentSize = 0;
    
    // 确保日志目录存在
    const dir = this.fs.dirname(this.filePath);
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdirSync(dir, { recursive: true });
    }
    
    // 初始化文件流
    this.initStream();
  }
  
  /**
   * 初始化文件流
   */
  private initStream(): void {
    // 关闭现有流
    if (this.stream) {
      this.stream.end();
    }
    
    // 获取文件当前大小
    try {
      const stats = this.fs.statSync(this.filePath);
      this.currentSize = stats.size;
    } catch (error) {
      this.currentSize = 0;
    }
    
    // 打开新的文件流
    this.stream = this.fs.createWriteStream(this.filePath, { flags: 'a' });
  }
  
  /**
   * 执行日志文件轮转
   */
  private rotate(): void {
    // 关闭当前流
    this.stream.end();
    
    // 重命名现有日志文件
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldPath = `${this.filePath}.${i}`;
      const newPath = `${this.filePath}.${i + 1}`;
      
      if (this.fs.existsSync(oldPath)) {
        this.fs.renameSync(oldPath, newPath);
      }
    }
    
    // 将当前日志文件重命名为第一个轮转文件
    if (this.fs.existsSync(this.filePath)) {
      this.fs.renameSync(this.filePath, `${this.filePath}.1`);
    }
    
    // 重新初始化文件流
    this.currentSize = 0;
    this.stream = this.fs.createWriteStream(this.filePath, { flags: 'a' });
  }
  
  /**
   * 将日志记录输出到文件
   * @param record 日志记录对象
   */
  append(record: LogRecord): void {
    const formattedLog = this.formatter.format(record) + '\n';
    const logSize = Buffer.byteLength(formattedLog, 'utf8');
    
    // 检查是否需要轮转
    if (this.currentSize + logSize > this.maxFileSize) {
      this.rotate();
    }
    
    // 写入日志
    this.stream.write(formattedLog);
    this.currentSize += logSize;
  }
  
  /**
   * 关闭输出器，释放资源
   */
  close(): void {
    if (this.stream) {
      this.stream.end();
    }
  }
}
```

### 4. 日志记录器实现

```typescript
// 日志记录器实现
export class LoggerImpl implements Logger {
  private name: string;
  private level: LogLevel;
  private appenders: LogAppender[];
  private async: boolean;
  
  /**
   * 日志记录器构造函数
   * @param name 日志器名称
   * @param config 日志配置
   */
  constructor(name: string, config: LoggerConfig, async: boolean = true) {
    this.name = name;
    this.level = config.level;
    this.appenders = config.appenders;
    this.async = async;
  }
  
  /**
   * 创建日志记录对象
   * @param level 日志级别
   * @param message 日志消息
   * @param context 上下文信息
   * @param error 错误对象
   * @returns 日志记录对象
   */
  private createLogRecord(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogRecord {
    return {
      timestamp: new Date(),
      level,
      loggerName: this.name,
      message,
      context,
      error
    };
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param context 上下文信息
   * @param error 错误对象
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    // 检查日志级别是否启用
    if (level < this.level) {
      return;
    }
    
    const record = this.createLogRecord(level, message, context, error);
    
    if (this.async) {
      // 异步写入日志
      process.nextTick(() => {
        this.appenders.forEach(appender => {
          try {
            appender.append(record);
          } catch (error) {
            // 避免日志输出器错误导致应用崩溃
            console.error('Failed to append log:', error);
          }
        });
      });
    } else {
      // 同步写入日志
      this.appenders.forEach(appender => {
        try {
          appender.append(record);
        } catch (error) {
          console.error('Failed to append log:', error);
        }
      });
    }
  }
  
  /**
   * 记录TRACE级别的日志
   * @param message 日志消息
   * @param context 上下文信息
   */
  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context);
  }
  
  /**
   * 记录DEBUG级别的日志
   * @param message 日志消息
   * @param context 上下文信息
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * 记录INFO级别的日志
   * @param message 日志消息
   * @param context 上下文信息
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * 记录WARN级别的日志
   * @param message 日志消息
   * @param context 上下文信息
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * 记录ERROR级别的日志
   * @param message 日志消息
   * @param error 错误对象
   * @param context 上下文信息
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
  
  /**
   * 记录FATAL级别的日志
   * @param message 日志消息
   * @param error 错误对象
   * @param context 上下文信息
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }
}
```

### 5. 日志管理器实现

```typescript
// 日志管理器实现
export class LogManagerImpl implements LogManager {
  private loggers: Map<string, Logger> = new Map();
  private defaultConfig: LoggerConfig;
  private appenders: LogAppender[] = [];
  
  /**
   * 日志管理器构造函数
   * @param defaultConfig 默认日志配置
   */
  constructor(defaultConfig: LoggerConfig) {
    this.defaultConfig = defaultConfig;
    
    // 保存所有输出器，以便在关闭时统一释放资源
    this.appenders = [...defaultConfig.appenders];
  }
  
  /**
   * 获取或创建日志记录器
   * @param name 日志器名称
   * @returns 日志记录器
   */
  getLogger(name: string): Logger {
    if (!this.loggers.has(name)) {
      this.loggers.set(name, new LoggerImpl(name, this.defaultConfig));
    }
    return this.loggers.get(name)!;
  }
  
  /**
   * 关闭所有日志输出器，释放资源
   */
  shutdown(): void {
    this.appenders.forEach(appender => {
      try {
        appender.close();
      } catch (error) {
        console.error('Failed to close appender:', error);
      }
    });
  }
}
```

### 6. 日志工厂和便捷方法

```typescript
// 日志工厂类，提供静态方法创建日志管理器和日志器
export class LoggerFactory {
  private static logManager: LogManager | null = null;
  
  /**
   * 初始化日志工厂
   * @param config 默认日志配置
   */
  public static initialize(config: LoggerConfig): void {
    this.logManager = new LogManagerImpl(config);
  }
  
  /**
   * 获取日志管理器
   * @returns 日志管理器
   */
  public static getLogManager(): LogManager {
    if (!this.logManager) {
      // 使用默认配置初始化
      const defaultFormatter = new TextFormatter();
      const defaultAppender = new ConsoleAppender(defaultFormatter);
      this.initialize({
        level: LogLevel.INFO,
        appenders: [defaultAppender],
        formatter: defaultFormatter
      });
    }
    return this.logManager;
  }
  
  /**
   * 获取日志记录器
   * @param name 日志器名称
   * @returns 日志记录器
   */
  public static getLogger(name: string): Logger {
    return this.getLogManager().getLogger(name);
  }
  
  /**
   * 关闭日志工厂，释放资源
   */
  public static shutdown(): void {
    if (this.logManager) {
      this.logManager.shutdown();
      this.logManager = null;
    }
  }
}

// 全局便捷日志函数
export const getLogger = (name: string): Logger => {
  return LoggerFactory.getLogger(name);
};
```

## 测试

### 1. 单元测试

```typescript
import { LogLevel, LoggerFactory, ConsoleAppender, FileAppender, RotatingFileAppender, TextFormatter, JsonFormatter } from './logging';
import * as fs from 'fs';
import * as path from 'path';

describe('日志系统单元测试', () => {
  let tempLogDir: string;
  
  beforeEach(() => {
    // 创建临时日志目录
    tempLogDir = path.join(__dirname, 'temp-logs');
    if (!fs.existsSync(tempLogDir)) {
      fs.mkdirSync(tempLogDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // 关闭日志工厂，释放资源
    LoggerFactory.shutdown();
    
    // 删除临时日志目录
    if (fs.existsSync(tempLogDir)) {
      fs.rmSync(tempLogDir, { recursive: true, force: true });
    }
  });
  
  test('控制台输出器测试', () => {
    // 捕获控制台输出
    const consoleLog = jest.spyOn(console, 'info').mockImplementation();
    
    // 配置日志系统
    const formatter = new TextFormatter();
    const appender = new ConsoleAppender(formatter);
    
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [appender],
      formatter
    });
    
    // 获取日志器并记录日志
    const logger = LoggerFactory.getLogger('test-logger');
    logger.info('测试控制台日志');
    
    // 恢复控制台输出
    consoleLog.mockRestore();
    
    // 验证日志是否被调用
    expect(consoleLog).toHaveBeenCalled();
  });
  
  test('文件输出器测试', () => {
    const logFilePath = path.join(tempLogDir, 'test.log');
    
    // 配置日志系统
    const formatter = new TextFormatter();
    const appender = new FileAppender(formatter, logFilePath);
    
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [appender],
      formatter
    });
    
    // 获取日志器并记录日志
    const logger = LoggerFactory.getLogger('test-logger');
    logger.info('测试文件日志');
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 验证日志文件是否创建并包含预期内容
    expect(fs.existsSync(logFilePath)).toBe(true);
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    expect(logContent).toContain('测试文件日志');
  });
  
  test('JSON格式化器测试', () => {
    const logFilePath = path.join(tempLogDir, 'test-json.log');
    
    // 配置日志系统
    const formatter = new JsonFormatter();
    const appender = new FileAppender(formatter, logFilePath);
    
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [appender],
      formatter
    });
    
    // 获取日志器并记录日志
    const logger = LoggerFactory.getLogger('test-logger');
    logger.info('测试JSON日志', { key: 'value' });
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 验证日志文件是否创建并包含预期内容
    expect(fs.existsSync(logFilePath)).toBe(true);
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    const logObject = JSON.parse(logContent);
    
    expect(logObject.message).toBe('测试JSON日志');
    expect(logObject.context).toEqual({ key: 'value' });
    expect(logObject.level).toBe('INFO');
  });
  
  test('日志级别过滤测试', () => {
    const logFilePath = path.join(tempLogDir, 'test-level.log');
    
    // 配置日志系统，只记录WARN及以上级别的日志
    const formatter = new TextFormatter();
    const appender = new FileAppender(formatter, logFilePath);
    
    LoggerFactory.initialize({
      level: LogLevel.WARN,
      appenders: [appender],
      formatter
    });
    
    // 获取日志器并记录不同级别的日志
    const logger = LoggerFactory.getLogger('test-logger');
    logger.debug('调试日志（不应记录）');
    logger.info('信息日志（不应记录）');
    logger.warn('警告日志（应记录）');
    logger.error('错误日志（应记录）');
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 验证日志文件内容
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    expect(logContent).not.toContain('调试日志');
    expect(logContent).not.toContain('信息日志');
    expect(logContent).toContain('警告日志');
    expect(logContent).toContain('错误日志');
  });
  
  test('错误日志记录测试', () => {
    const logFilePath = path.join(tempLogDir, 'test-error.log');
    
    // 配置日志系统
    const formatter = new TextFormatter();
    const appender = new FileAppender(formatter, logFilePath);
    
    LoggerFactory.initialize({
      level: LogLevel.ERROR,
      appenders: [appender],
      formatter
    });
    
    // 获取日志器并记录错误日志
    const logger = LoggerFactory.getLogger('test-logger');
    try {
      throw new Error('测试错误');
    } catch (error) {
      logger.error('发生错误', error as Error);
    }
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 验证错误日志是否包含错误信息和堆栈跟踪
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    expect(logContent).toContain('发生错误');
    expect(logContent).toContain('测试错误');
    expect(logContent).toContain('Error:');
    expect(logContent).toContain('Stack Trace:');
  });
});
```

### 2. 集成测试

```typescript
import { LogLevel, LoggerFactory, ConsoleAppender, FileAppender, RotatingFileAppender, TextFormatter, JsonFormatter } from './logging';
import * as fs from 'fs';
import * as path from 'path';

describe('日志系统集成测试', () => {
  let tempLogDir: string;
  
  beforeEach(() => {
    // 创建临时日志目录
    tempLogDir = path.join(__dirname, 'temp-logs-integration');
    if (!fs.existsSync(tempLogDir)) {
      fs.mkdirSync(tempLogDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // 关闭日志工厂，释放资源
    LoggerFactory.shutdown();
    
    // 删除临时日志目录
    if (fs.existsSync(tempLogDir)) {
      fs.rmSync(tempLogDir, { recursive: true, force: true });
    }
  });
  
  test('多输出器集成测试', () => {
    const logFilePath = path.join(tempLogDir, 'test-multi.log');
    
    // 捕获控制台输出
    const consoleLog = jest.spyOn(console, 'info').mockImplementation();
    
    // 配置日志系统，同时输出到控制台和文件
    const formatter = new TextFormatter();
    const consoleAppender = new ConsoleAppender(formatter);
    const fileAppender = new FileAppender(formatter, logFilePath);
    
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [consoleAppender, fileAppender],
      formatter
    });
    
    // 获取日志器并记录日志
    const logger = LoggerFactory.getLogger('test-logger');
    logger.info('测试多输出器日志');
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 恢复控制台输出
    consoleLog.mockRestore();
    
    // 验证控制台日志是否被调用
    expect(consoleLog).toHaveBeenCalled();
    
    // 验证日志文件是否创建并包含预期内容
    expect(fs.existsSync(logFilePath)).toBe(true);
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    expect(logContent).toContain('测试多输出器日志');
  });
  
  test('日志轮转集成测试', (done) => {
    const logFilePath = path.join(tempLogDir, 'test-rotate.log');
    const maxFileSize = 100; // 100字节
    const maxFiles = 2;
    
    // 配置日志系统，使用轮转文件输出器
    const formatter = new TextFormatter();
    const rotatingAppender = new RotatingFileAppender(formatter, logFilePath, maxFileSize, maxFiles);
    
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [rotatingAppender],
      formatter
    });
    
    // 获取日志器
    const logger = LoggerFactory.getLogger('test-logger');
    
    // 记录大量日志，触发日志轮转
    for (let i = 0; i < 10; i++) {
      logger.info(`测试日志轮转 ${i}`);
    }
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 延迟验证，确保异步操作完成
    setTimeout(() => {
      // 验证当前日志文件存在
      expect(fs.existsSync(logFilePath)).toBe(true);
      
      // 验证轮转文件存在
      expect(fs.existsSync(`${logFilePath}.1`)).toBe(true);
      expect(fs.existsSync(`${logFilePath}.2`)).toBe(true);
      
      // 验证旧的轮转文件被删除
      expect(fs.existsSync(`${logFilePath}.3`)).toBe(false);
      
      done();
    }, 100);
  });
  
  test('不同日志器配置测试', () => {
    const infoLogPath = path.join(tempLogDir, 'test-info.log');
    const errorLogPath = path.join(tempLogDir, 'test-error.log');
    
    // 配置日志系统
    const textFormatter = new TextFormatter();
    const jsonFormatter = new JsonFormatter();
    
    const consoleAppender = new ConsoleAppender(textFormatter);
    const infoFileAppender = new FileAppender(textFormatter, infoLogPath);
    const errorFileAppender = new FileAppender(jsonFormatter, errorLogPath);
    
    // 初始化日志工厂
    LoggerFactory.initialize({
      level: LogLevel.INFO,
      appenders: [consoleAppender, infoFileAppender],
      formatter: textFormatter
    });
    
    // 获取两个不同名称的日志器
    const infoLogger = LoggerFactory.getLogger('info-logger');
    const errorLogger = LoggerFactory.getLogger('error-logger');
    
    // 记录不同级别的日志
    infoLogger.info('信息日志');
    errorLogger.error('错误日志');
    
    // 关闭日志系统，确保日志写入磁盘
    LoggerFactory.shutdown();
    
    // 验证日志文件内容
    const infoLogContent = fs.readFileSync(infoLogPath, 'utf8');
    const errorLogContent = fs.readFileSync(errorLogPath, 'utf8');
    
    expect(infoLogContent).toContain('信息日志');
    expect(infoLogContent).toContain('错误日志');
    expect(errorLogContent).toContain('错误日志');
    
    // 验证JSON格式
    expect(() => JSON.parse(errorLogContent)).not.toThrow();
  });
});
```

## 集成示例

### 1. 基本使用

```typescript
import { LoggerFactory, LogLevel, ConsoleAppender, TextFormatter } from './logging';

// 初始化日志系统
const formatter = new TextFormatter();
const appender = new ConsoleAppender(formatter);

LoggerFactory.initialize({
  level: LogLevel.INFO,
  appenders: [appender],
  formatter
});

// 获取日志器
const logger = LoggerFactory.getLogger('app');

// 记录不同级别的日志
logger.trace('这是一条跟踪日志');
logger.debug('这是一条调试日志');
logger.info('这是一条信息日志');
logger.warn('这是一条警告日志');
logger.error('这是一条错误日志', new Error('测试错误'));
logger.fatal('这是一条致命日志', new Error('测试致命错误'));

// 记录带上下文的日志
logger.info('用户登录', {
  userId: '123',
  username: 'testuser',
  ip: '127.0.0.1'
});
```

### 2. 多输出器配置

```typescript
import { LoggerFactory, LogLevel, ConsoleAppender, FileAppender, RotatingFileAppender, TextFormatter, JsonFormatter } from './logging';
import * as path from 'path';

// 创建不同的格式化器
const textFormatter = new TextFormatter();
const jsonFormatter = new JsonFormatter();

// 创建不同的输出器
const consoleAppender = new ConsoleAppender(textFormatter);
const fileAppender = new FileAppender(textFormatter, path.join('logs', 'app.log'));
const errorAppender = new FileAppender(jsonFormatter, path.join('logs', 'error.log'));
const rotatingAppender = new RotatingFileAppender(textFormatter, path.join('logs', 'app-rotate.log'), 10 * 1024 * 1024, 5);

// 初始化日志系统
LoggerFactory.initialize({
  level: LogLevel.INFO,
  appenders: [consoleAppender, fileAppender, errorAppender, rotatingAppender],
  formatter: textFormatter
});

// 获取日志器
const logger = LoggerFactory.getLogger('app');

// 记录日志
logger.info('应用启动');
```

### 3. 在Express应用中集成

```typescript
import express from 'express';
import { LoggerFactory, LogLevel, ConsoleAppender, FileAppender, TextFormatter } from './logging';
import * as path from 'path';

// 初始化日志系统
const formatter = new TextFormatter();
const consoleAppender = new ConsoleAppender(formatter);
const fileAppender = new FileAppender(formatter, path.join('logs', 'express.log'));

LoggerFactory.initialize({
  level: LogLevel.INFO,
  appenders: [consoleAppender, fileAppender],
  formatter
});

const logger = LoggerFactory.getLogger('express-app');
const app = express();
const port = 3000;

// 请求日志中间件
app.use((req, res, next) => {
  logger.info('收到请求', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('请求完成', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
});

// 路由
app.get('/', (req, res) => {
  logger.info('处理根路径请求');
  res.send('Hello World!');
});

app.get('/error', (req, res) => {
  try {
    throw new Error('测试错误');
  } catch (error) {
    logger.error('发生错误', error as Error, {
      url: req.url
    });
    res.status(500).send('Internal Server Error');
  }
});

// 错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('未捕获的错误', err, {
    url: req.url
  });
  res.status(500).send('Internal Server Error');
});

// 启动服务器
app.listen(port, () => {
  logger.info(`服务器启动在 http://localhost:${port}`);
});

// 进程退出时关闭日志系统
process.on('SIGINT', () => {
  logger.info('收到退出信号，关闭服务器');
  LoggerFactory.shutdown();
  process.exit(0);
});
```

## 性能优化

1. **异步日志写入**：默认采用异步日志写入，避免阻塞主线程
2. **批量写入**：可扩展实现批量写入，减少I/O操作次数
3. **缓冲区**：可添加缓冲区机制，进一步减少I/O操作
4. **级别过滤**：在日志记录器层面进行级别过滤，避免不必要的格式化和输出
5. **输出器隔离**：不同输出器之间相互独立，一个输出器故障不会影响其他输出器

## 扩展建议

1. **添加更多输出器**：
   - Syslog输出器
   - 数据库输出器
   - 远程日志服务器输出器（如ELK Stack）

2. **添加更多格式化器**：
   - CSV格式化器
   - 自定义模板格式化器

3. **添加日志过滤功能**：
   - 基于日志内容的过滤
   - 基于上下文的过滤
   - 基于时间的过滤

4. **添加日志聚合功能**：
   - 日志聚合和分析
   - 日志告警
   - 日志可视化

5. **添加分布式追踪支持**：
   - 与OpenTelemetry集成
   - 添加traceId和spanId到日志记录中

## 总结

本日志系统实现了一个功能全面、性能优良、可扩展的日志框架，遵循了Clean Architecture原则，具有以下特点：

- **灵活的配置**：支持多种输出器和格式化器的组合
- **高性能**：默认采用异步日志写入，避免阻塞主线程
- **可扩展**：通过接口设计，便于添加新的输出器和格式化器
- **完整的日志信息**：包含时间、级别、消息、上下文和堆栈跟踪
- **良好的错误处理**：输出器错误不会导致应用崩溃
- **全面的测试**：包含单元测试和集成测试

该日志系统可以满足不同规模应用的日志需求，从简单的控制台输出到复杂的多输出器、多格式化器配置，都能轻松应对。