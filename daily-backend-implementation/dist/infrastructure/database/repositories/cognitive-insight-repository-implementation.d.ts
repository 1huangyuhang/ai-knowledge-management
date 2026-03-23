import { Repository } from 'typeorm';
import { CognitiveInsight } from '../../../domain/entities/cognitive-insight';
import { CognitiveInsightRepository } from '../../../domain/repositories/cognitive-insight-repository';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveInsightEntity } from '../entities/cognitive-insight.entity';
export declare class CognitiveInsightRepositoryImpl implements CognitiveInsightRepository {
    private readonly cognitiveInsightEntityRepository;
    constructor(cognitiveInsightEntityRepository: Repository<CognitiveInsightEntity>);
    private toEntity;
    private toDomain;
    create(insight: CognitiveInsight): Promise<CognitiveInsight>;
    getById(id: UUID): Promise<CognitiveInsight | null>;
    getByUserId(userId: UUID): Promise<CognitiveInsight[]>;
    getUnreadByUserId(userId: UUID): Promise<CognitiveInsight[]>;
    update(insight: CognitiveInsight): Promise<CognitiveInsight>;
    delete(id: UUID): Promise<boolean>;
    deleteMany(ids: UUID[]): Promise<number>;
    markAsRead(id: UUID): Promise<boolean>;
    markManyAsRead(ids: UUID[]): Promise<number>;
    getByTypeAndUserId(userId: UUID, type: string): Promise<CognitiveInsight[]>;
    getRecentByUserId(userId: UUID, limit: number): Promise<CognitiveInsight[]>;
}
//# sourceMappingURL=cognitive-insight-repository-implementation.d.ts.map