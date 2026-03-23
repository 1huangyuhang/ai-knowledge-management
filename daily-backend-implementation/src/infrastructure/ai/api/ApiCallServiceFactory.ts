import { ApiCallService } from './ApiCallService';
import { HttpApiCallService } from './HttpApiCallService';
import { ApiCallConfig, DEFAULT_API_CALL_CONFIG } from './ApiCallConfig';
import { LoggerService } from '../../../infrastructure/logging/logger.service';

/**
 * API 调用服务工厂，用于创建 API 调用服务实例
 */
export class ApiCallServiceFactory {
  /**
   * 创建 API 调用服务实例
   * @param config API 调用配置
   * @param logger 日志记录器
   * @returns API 调用服务实例
   */
  static createService(config: Partial<ApiCallConfig>, logger: LoggerService): ApiCallService {
    const fullConfig = { ...DEFAULT_API_CALL_CONFIG, ...config };
    
    return new HttpApiCallService(
      fullConfig.baseUrl,
      fullConfig.apiKey,
      logger,
      fullConfig.defaultTimeout
    );
  }
}
