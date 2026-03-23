import { Repository } from 'typeorm';
import { ThoughtFragment } from '../../../domain/entities/thought-fragment';
import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
import { UUID } from '../../../domain/value-objects/uuid';
import { ThoughtFragmentEntity } from '../entities/thought-fragment.entity';
export declare class ThoughtFragmentRepositoryImpl implements ThoughtFragmentRepository {
    private readonly thoughtFragmentEntityRepository;
    constructor(thoughtFragmentEntityRepository: Repository<ThoughtFragmentEntity>);
    private toEntity;
    private toDomain;
    create(fragment: ThoughtFragment): Promise<ThoughtFragment>;
    getById(id: UUID): Promise<ThoughtFragment | null>;
    getByUserId(userId: UUID): Promise<ThoughtFragment[]>;
    getUnprocessedByUserId(userId: UUID): Promise<ThoughtFragment[]>;
    getByIds(ids: UUID[]): Promise<ThoughtFragment[]>;
    update(fragment: ThoughtFragment): Promise<ThoughtFragment>;
    delete(id: UUID): Promise<boolean>;
    deleteMany(ids: UUID[]): Promise<number>;
    markAsProcessed(id: UUID): Promise<boolean>;
    markManyAsProcessed(ids: UUID[]): Promise<number>;
}
//# sourceMappingURL=thought-fragment-repository-implementation.d.ts.map