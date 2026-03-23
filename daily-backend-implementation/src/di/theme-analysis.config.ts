/**
 * 主题分析服务相关依赖配置
 * 用于将主题分析相关的服务注册到依赖注入容器中
 */
import { container } from './container';
import { ThemeAnalysisService } from '../application/ai/cognitive-feedback/theme-analysis-service';
import { ThemeAnalysisServiceImpl } from '../application/ai/cognitive-feedback/theme-analysis-service-impl';

/**
 * 初始化主题分析相关依赖
 */
export async function initializeThemeAnalysisDependencies(): Promise<void> {
  // 注册主题分析服务
  container.register<ThemeAnalysisService>(
    'ThemeAnalysisService',
    () => {
      const cognitiveModelRepository = container.resolve('CognitiveModelRepository');
      return new ThemeAnalysisServiceImpl(
        cognitiveModelRepository
      );
    },
    true // 单例模式
  );

  console.log('Theme analysis dependencies initialized and registered in DI container');
}

/**
 * 获取主题分析相关依赖键名
 */
export const ThemeAnalysisKeys = {
  ThemeAnalysisService: 'ThemeAnalysisService'
};
