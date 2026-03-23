import { CognitiveInsight } from '../entities/cognitive-insight';
import { UUID } from '../value-objects/uuid';
export interface CognitiveInsightRepository {
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
//# sourceMappingURL=cognitive-insight-repository.d.ts.map