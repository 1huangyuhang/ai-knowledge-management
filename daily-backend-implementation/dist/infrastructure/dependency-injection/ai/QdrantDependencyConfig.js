"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantDependencyConfigImpl = void 0;
const QdrantClient_1 = require("../../ai/embedding/qdrant/QdrantClient");
const VectorRepository_1 = require("../../ai/embedding/qdrant/VectorRepository");
const APICaller_1 = require("../../ai/api/APICaller");
class QdrantDependencyConfigImpl {
    register(container) {
        container.register(QdrantClient_1.QdrantClientFactory, {
            useFactory: () => {
                const apiCaller = container.resolve(APICaller_1.APICaller);
                return new QdrantClient_1.QdrantClientFactory(apiCaller, {
                    baseUrl: process.env.QDRANT_BASE_URL || 'http://localhost:6333',
                    apiKey: process.env.QDRANT_API_KEY,
                    defaultVectorSize: parseInt(process.env.EMBEDDING_VECTOR_SIZE || '1536')
                });
            }
        });
        container.register(QdrantClient_1.QdrantClient, {
            useFactory: () => {
                const factory = container.resolve(QdrantClient_1.QdrantClientFactory);
                return factory.create();
            }
        });
        container.register(VectorRepository_1.VectorRepositoryFactory, {
            useFactory: () => {
                const client = container.resolve(QdrantClient_1.QdrantClient);
                return new VectorRepository_1.VectorRepositoryFactory(client, {
                    collectionName: process.env.QDRANT_COLLECTION_NAME || 'cognitive_vectors',
                    vectorSize: parseInt(process.env.EMBEDDING_VECTOR_SIZE || '1536'),
                    distance: process.env.QDRANT_DISTANCE || 'Cosine'
                });
            }
        });
        container.register(entities_1.VectorRepository, {
            useFactory: () => {
                const factory = container.resolve(VectorRepository_1.VectorRepositoryFactory);
                return factory.create();
            }
        });
    }
}
exports.QdrantDependencyConfigImpl = QdrantDependencyConfigImpl;
//# sourceMappingURL=QdrantDependencyConfig.js.map