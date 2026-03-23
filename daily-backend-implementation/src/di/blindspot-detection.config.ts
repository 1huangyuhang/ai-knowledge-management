/**
 * 盲点检测服务相关依赖配置
 * 用于将盲点检测相关的服务注册到依赖注入容器中
 */
import { container } from './container';
import { BlindspotDetectionService } from '../application/ai/cognitive-feedback/blindspot-detection-service';
import { BlindspotDetectionServiceImpl } from '../application/ai/cognitive-feedback/blindspot-detection-service-impl';

/**
 * 初始化盲点检测相关依赖
 */
export async function initializeBlindspotDetectionDependencies(): Promise<void> {
  // 注册盲点检测服务
  container.register<BlindspotDetectionService>(
    'BlindspotDetectionService',
    () => {
      const cognitiveModelRepository = container.resolve('CognitiveModelRepository');
      return new BlindspotDetectionServiceImpl(
        cognitiveModelRepository
      );
    },
    true // 单例模式
  );

  console.log('Blindspot detection dependencies initialized and registered in DI container');
}

/**
 * 获取盲点检测相关依赖键名
 */
export const BlindspotDetectionKeys = {
  BlindspotDetectionService: 'BlindspotDetectionService'
};
