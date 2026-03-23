/**
 * 洞察生成服务相关依赖配置
 * 用于将洞察生成相关的服务注册到依赖注入容器中
 */
import { container } from './container';
import { InsightGenerationService } from '../application/ai/cognitive-feedback/insight-generation-service';
import { InsightGenerationServiceImpl } from '../application/ai/cognitive-feedback/insight-generation-service-impl';

/**
 * 初始化洞察生成相关依赖
 */
export async function initializeInsightGenerationDependencies(): Promise<void> {
  // 注册洞察生成服务
  container.register<InsightGenerationService>(
    'InsightGenerationService',
    () => {
      const cognitiveModelRepository = container.resolve('CognitiveModelRepository');
      const evolutionAnalysisService = container.resolve('EvolutionAnalysisService');
      const cacheService = container.resolve('CacheService');
      return new InsightGenerationServiceImpl(
        cognitiveModelRepository,
        evolutionAnalysisService,
        cacheService
      );
    },
    true // 单例模式
  );

  console.log('Insight generation dependencies initialized and registered in DI container');
}

/**
 * 获取洞察生成相关依赖键名
 */
export const InsightGenerationKeys = {
  InsightGenerationService: 'InsightGenerationService'
};
