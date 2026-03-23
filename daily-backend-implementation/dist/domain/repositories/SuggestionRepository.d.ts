import { Suggestion } from '../entities/Suggestion';
import { UUID } from '../value-objects/UUID';
import { SuggestionType } from '../enums/SuggestionType';
import { SuggestionCategory } from '../enums/SuggestionCategory';
export interface SuggestionRepository {
    create(suggestion: Suggestion): Promise<Suggestion>;
    getById(id: UUID): Promise<Suggestion | null>;
    getByUserId(userId: string, page: number, limit: number): Promise<Suggestion[]>;
    getByCognitiveModelId(cognitiveModelId: string, page: number, limit: number): Promise<Suggestion[]>;
    getByType(type: SuggestionType, userId: string): Promise<Suggestion[]>;
    getByCategory(category: SuggestionCategory, userId: string): Promise<Suggestion[]>;
    update(suggestion: Suggestion): Promise<Suggestion>;
    delete(id: UUID): Promise<boolean>;
    getTotalCountByUserId(userId: string): Promise<number>;
    getHighPriorityCountByUserId(userId: string, priorityThreshold: number): Promise<number>;
}
//# sourceMappingURL=SuggestionRepository.d.ts.map