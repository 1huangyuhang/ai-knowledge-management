import { DependencyContainer } from '../DependencyContainer';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
import { ApiCallService } from '../../../infrastructure/ai/api/ApiCallService';
import { ApiCallServiceFactory } from '../../../infrastructure/ai/api/ApiCallServiceFactory';

/**
 * API调用相关依赖配置
 * 负责将API调用相关的服务注册到依赖注入容器中
 */
export class APIDependencyConfig {
  /**
   * 配置API调用相关依赖
   * @param container 依赖注入容器
   */
  static configure(container: DependencyContainer): void {
    // 注册API调用服务
    container.registerSingleton<ApiCallService>(ApiCallService, () => {
      const loggerService = container.resolve<LoggerService>('LoggerService');
      
      return ApiCallServiceFactory.createService(
        {
          apiKey: process.env.OPENAI_API_KEY || ''
        },
        loggerService
      );
    });
  }
}
