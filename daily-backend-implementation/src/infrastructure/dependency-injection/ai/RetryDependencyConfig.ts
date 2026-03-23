import { DependencyContainer } from '../DependencyContainer';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
import { ApiCallService } from '../../../infrastructure/ai/api/ApiCallService';
import { ApiCallServiceFactory } from '../../../infrastructure/ai/api/ApiCallServiceFactory';
import { RetryableApiCallService } from '../../../infrastructure/ai/api/RetryableApiCallService';
import { RetryService } from '../../../application/ai/retry/RetryService';
import { DefaultRetryService } from '../../../application/ai/retry/DefaultRetryService';

/**
 * 重试机制相关依赖配置
 * 负责将重试机制相关的服务注册到依赖注入容器中
 */
export class RetryDependencyConfig {
  /**
   * 配置重试机制相关依赖
   * @param container 依赖注入容器
   */
  static configure(container: DependencyContainer): void {
    // 注册重试服务
    container.registerSingleton<RetryService>(RetryService, () => {
      const loggerService = container.resolve<LoggerService>('LoggerService');
      return new DefaultRetryService(loggerService);
    });
    
    // 注册可重试的API调用服务，替换原有的API调用服务
    container.registerSingleton<ApiCallService>(ApiCallService, () => {
      const loggerService = container.resolve<LoggerService>('LoggerService');
      const retryService = container.resolve<RetryService>(RetryService);
      
      // 创建原始API调用服务
      const originalApiCallService = ApiCallServiceFactory.createService(
        {
          apiKey: process.env.OPENAI_API_KEY || ''
        },
        loggerService
      );
      
      // 包装为可重试版本
      return new RetryableApiCallService(originalApiCallService, retryService);
    });
  }
}
