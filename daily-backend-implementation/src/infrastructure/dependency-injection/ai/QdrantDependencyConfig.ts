import { DependencyContainer } from '../DependencyContainer';
import { QdrantClientFactory, QdrantClient } from '../../ai/embedding/qdrant/QdrantClient';
import { VectorRepositoryFactory, VectorRepository } from '../../ai/embedding/qdrant/VectorRepository';
import { APICaller } from '../../ai/api/APICaller';
import { VectorRepository as IVectorRepository } from '../../../domain/entities';

/**
 * Qdrant依赖配置接口
 */
export interface QdrantDependencyConfig {
  /**
   * 配置依赖注入
   * @param container 依赖容器
   */
  register(container: DependencyContainer): void;
}

/**
 * Qdrant依赖配置实现
 */
export class QdrantDependencyConfigImpl implements QdrantDependencyConfig {
  /**
   * 配置依赖注入
   * @param container 依赖容器
   */
  register(container: DependencyContainer): void {
    // 注册Qdrant客户端工厂
    container.register(QdrantClientFactory, {
      useFactory: () => {
        const apiCaller = container.resolve<APICaller>(APICaller);
        
        return new QdrantClientFactory(apiCaller, {
          baseUrl: process.env.QDRANT_BASE_URL || 'http://localhost:6333',
          apiKey: process.env.QDRANT_API_KEY,
          defaultVectorSize: parseInt(process.env.EMBEDDING_VECTOR_SIZE || '1536')
        });
      }
    });

    // 注册Qdrant客户端实例
    container.register(QdrantClient, {
      useFactory: () => {
        const factory = container.resolve<QdrantClientFactory>(QdrantClientFactory);
        return factory.create();
      }
    });

    // 注册向量仓库工厂
    container.register(VectorRepositoryFactory, {
      useFactory: () => {
        const client = container.resolve<QdrantClient>(QdrantClient);
        
        return new VectorRepositoryFactory(client, {
          collectionName: process.env.QDRANT_COLLECTION_NAME || 'cognitive_vectors',
          vectorSize: parseInt(process.env.EMBEDDING_VECTOR_SIZE || '1536'),
          distance: (process.env.QDRANT_DISTANCE as 'Cosine' | 'Euclid' | 'Dot') || 'Cosine'
        });
      }
    });

    // 注册向量仓库实例
    container.register(IVectorRepository, {
      useFactory: () => {
        const factory = container.resolve<VectorRepositoryFactory>(VectorRepositoryFactory);
        return factory.create();
      }
    });
  }
}