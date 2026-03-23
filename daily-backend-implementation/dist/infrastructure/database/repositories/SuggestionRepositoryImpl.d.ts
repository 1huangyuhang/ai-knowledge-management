import { Suggestion } from '../../../domain/entities/Suggestion';
import { UUID } from '../../../domain/value-objects/UUID';
import { SuggestionRepository } from '../../../domain/repositories/SuggestionRepository';
import { SuggestionType } from '../../../domain/enums/SuggestionType';
import { SuggestionCategory } from '../../../domain/enums/SuggestionCategory';
import { DatabaseConnection } from '../connection/DatabaseConnection';
export declare class SuggestionRepositoryImpl implements SuggestionRepository {
    private readonly databaseConnection;
    constructor(databaseConnection: DatabaseConnection);
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
    private mapRowToSuggestion;
}
//# sourceMappingURL=SuggestionRepositoryImpl.d.ts.map