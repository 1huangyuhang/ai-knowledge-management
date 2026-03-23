/**
 * 差距识别服务相关依赖配置
 * 用于将差距识别相关的服务注册到依赖注入容器中
 */
import { container } from './container';
import { GapIdentificationService } from '../application/ai/cognitive-feedback/gap-identification-service';
import { GapIdentificationServiceImpl } from '../application/ai/cognitive-feedback/gap-identification-service-impl';

/**
 * 初始化差距识别相关依赖
 */
export async function initializeGapIdentificationDependencies(): Promise<void> {
  // 注册差距识别服务
  container.register<GapIdentificationService>(
    'GapIdentificationService',
    () => {
      const cognitiveModelRepository = container.resolve('CognitiveModelRepository');
      return new GapIdentificationServiceImpl(
        cognitiveModelRepository
      );
    },
    true // 单例模式
  );

  console.log('Gap identification dependencies initialized and registered in DI container');
}

/**
 * 获取差距识别相关依赖键名
 */
export const GapIdentificationKeys = {
  GapIdentificationService: 'GapIdentificationService'
};
