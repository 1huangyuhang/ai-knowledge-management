import { UserEntity } from './user.entity';
export declare class CognitiveInsightEntity {
    id: string;
    userId: string;
    user: UserEntity;
    modelId: string | null;
    type: string;
    isRead: boolean;
    content: Record<string, any>;
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=cognitive-insight.entity.d.ts.map