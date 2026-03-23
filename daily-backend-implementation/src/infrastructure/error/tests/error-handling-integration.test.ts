import { DefaultErrorHandler } from '../error-handler';
import { AuthError, CognitiveError, DomainError, ValidationError } from '../../../domain/errors/domain-error';
import { PinoLoggerService } from '../../logging/pino-logger.service';

describe('ErrorHandling Integration Tests', () => {
  let errorHandler: DefaultErrorHandler;
  let originalConsoleError: typeof console.error;
  let errorLogs: string[] = [];

  beforeEach(() => {
    // 保存原始console.error
    originalConsoleError = console.error;
    
    // 重写console.error以捕获错误日志
    console.error = (...args: any[]) => {
      errorLogs.push(JSON.stringify(args));
      originalConsoleError(...args);
    };
    
    // 创建日志服务实例
    const logger = new PinoLoggerService();
    
    // 创建错误处理程序实例，设置为开发环境以获取详细错误信息
    errorHandler = new DefaultErrorHandler(logger, true);
    errorLogs = [];
  });

  afterEach(() => {
    // 恢复原始console.error
    console.error = originalConsoleError;
  });

  test('should handle auth errors', async () => {
    // Arrange
    const error = new AuthError('Invalid credentials', 'INVALID_PASSWORD');

    // Act
    const response = errorHandler.handleError(error);

    // Assert
    expect(response.statusCode).toBe(401);
    expect(response.message).toBe('Invalid credentials');
    expect(response.errorCode).toBe('INVALID_PASSWORD');
    expect(response.details).toHaveProperty('stack');
  });

  test('should handle cognitive errors', async () => {
    // Arrange
    const error = new CognitiveError('Model not found', 'MODEL_NOT_FOUND');

    // Act
    const response = errorHandler.handleError(error);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(response.message).toBe('Model not found');
    expect(response.errorCode).toBe('MODEL_NOT_FOUND');
    expect(response.details).toHaveProperty('stack');
  });

  test('should handle domain errors', async () => {
    // Arrange
    const error = new ValidationError('Invalid input');

    // Act
    const response = errorHandler.handleError(error);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.message).toBe('Invalid input');
    expect(response.errorCode).toBe('VALIDATION_ERROR');
    expect(response.details).toHaveProperty('stack');
  });

  test('should handle regular errors', async () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    const response = errorHandler.handleError(error);

    // Assert
    expect(response.statusCode).toBe(500);
    expect(response.message).toBe('An unexpected error occurred');
    expect(response.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(response.details).toHaveProperty('message', 'Test error');
    expect(response.details).toHaveProperty('stack');
  });

  test('should handle different auth error codes', async () => {
    // Arrange & Act
    const invalidInputError = new AuthError('Invalid input', 'INVALID_INPUT');
    const invalidInputResponse = errorHandler.handleError(invalidInputError);
    
    const emailExistsError = new AuthError('Email already exists', 'EMAIL_ALREADY_EXISTS');
    const emailExistsResponse = errorHandler.handleError(emailExistsError);
    
    const userNotFoundError = new AuthError('User not found', 'USER_NOT_FOUND');
    const userNotFoundResponse = errorHandler.handleError(userNotFoundError);
    
    const userNotActiveError = new AuthError('User not active', 'USER_NOT_ACTIVE');
    const userNotActiveResponse = errorHandler.handleError(userNotActiveError);

    // Assert
    expect(invalidInputResponse.statusCode).toBe(400); // INVALID_INPUT 在AuthError中返回400
    expect(emailExistsResponse.statusCode).toBe(409);
    expect(userNotFoundResponse.statusCode).toBe(401);
    expect(userNotActiveResponse.statusCode).toBe(403);
  });

  test('should handle different cognitive error codes', async () => {
    // Arrange & Act
    const modelNotFoundError = new CognitiveError('Model not found', 'MODEL_NOT_FOUND');
    const modelNotFoundResponse = errorHandler.handleError(modelNotFoundError);
    
    const thoughtFragmentNotFoundError = new CognitiveError('Thought fragment not found', 'THOUGHT_FRAGMENT_NOT_FOUND');
    const thoughtFragmentNotFoundResponse = errorHandler.handleError(thoughtFragmentNotFoundError);
    
    const unauthorizedError = new CognitiveError('Unauthorized', 'UNAUTHORIZED');
    const unauthorizedResponse = errorHandler.handleError(unauthorizedError);

    // Assert
    expect(modelNotFoundResponse.statusCode).toBe(404);
    expect(thoughtFragmentNotFoundResponse.statusCode).toBe(404);
    expect(unauthorizedResponse.statusCode).toBe(403);
  });
});