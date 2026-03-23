/**
 * 反馈格式化服务相关依赖配置
 * 用于将反馈格式化相关的服务注册到依赖注入容器中
 */
import { container } from './container';
import { FeedbackFormattingService } from '../application/ai/cognitive-feedback/feedback-formatting-service';
import { FeedbackFormattingServiceImpl } from '../application/ai/cognitive-feedback/feedback-formatting-service-impl';

/**
 * 初始化反馈格式化相关依赖
 */
export async function initializeFeedbackFormattingDependencies(): Promise<void> {
  // 注册反馈格式化服务
  container.register<FeedbackFormattingService>(
    'FeedbackFormattingService',
    () => new FeedbackFormattingServiceImpl(),
    true // 单例模式
  );

  console.log('Feedback formatting dependencies initialized and registered in DI container');
}

/**
 * 获取反馈格式化相关依赖键名
 */
export const FeedbackFormattingKeys = {
  FeedbackFormattingService: 'FeedbackFormattingService'
};
