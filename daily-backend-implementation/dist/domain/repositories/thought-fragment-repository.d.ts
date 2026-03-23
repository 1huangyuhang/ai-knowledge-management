import { ThoughtFragment } from '../entities/thought-fragment';
import { UUID } from '../value-objects/uuid';
export interface ThoughtFragmentRepository {
    create(fragment: ThoughtFragment): Promise<ThoughtFragment>;
    getById(id: UUID): Promise<ThoughtFragment | null>;
    getByUserId(userId: UUID): Promise<ThoughtFragment[]>;
    getUnprocessedByUserId(userId: UUID): Promise<ThoughtFragment[]>;
    update(fragment: ThoughtFragment): Promise<ThoughtFragment>;
    delete(id: UUID): Promise<boolean>;
    deleteMany(ids: UUID[]): Promise<number>;
    markAsProcessed(id: UUID): Promise<boolean>;
    markManyAsProcessed(ids: UUID[]): Promise<number>;
    getByIds(ids: UUID[]): Promise<ThoughtFragment[]>;
}
//# sourceMappingURL=thought-fragment-repository.d.ts.map