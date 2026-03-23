import { DependencyContainer } from '../DependencyContainer';
import { EmbeddingServiceFactory } from '../../../application/services/llm/embedding/EmbeddingService';
import { OpenAIEmbeddingServiceFactory } from '../../ai/embedding/OpenAIEmbeddingService';
import { APICaller } from '../../ai/api/APICaller';
import { EmbeddingDependencyConfig as IEmbeddingDependencyConfig } from './DependencyConfig';

/**
 * 嵌入服务依赖配置
 */
export class EmbeddingDependencyConfig implements IEmbeddingDependencyConfig {
  /**
   * 配置依赖注入
   * @param container 依赖容器
   */
  register(container: DependencyContainer): void {
    container.register(EmbeddingServiceFactory, {
      useFactory: () => {
        const apiCaller = container.resolve<APICaller>(APICaller);
        
        return new OpenAIEmbeddingServiceFactory(apiCaller, {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
          baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
        });
      }
    });
  }
}
