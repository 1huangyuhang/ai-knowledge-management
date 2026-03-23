import { Repository } from 'typeorm';
import { CognitiveConcept } from '../../../domain/entities/cognitive-concept';
import { CognitiveConceptRepository } from '../../../domain/repositories/cognitive-concept-repository';
import { CognitiveConceptEntity } from '../entities/cognitive-concept.entity';
export declare class CognitiveConceptRepositoryImpl implements CognitiveConceptRepository {
    private readonly cognitiveConceptEntityRepository;
    constructor(cognitiveConceptEntityRepository: Repository<CognitiveConceptEntity>);
    private toEntity;
    private toDomain;
    create(concept: CognitiveConcept): Promise<CognitiveConcept>;
    getById(id: string): Promise<CognitiveConcept | null>;
    getByModelId(modelId: string): Promise<CognitiveConcept[]>;
    getByThoughtId(thoughtId: string): Promise<CognitiveConcept[]>;
    update(concept: CognitiveConcept): Promise<CognitiveConcept>;
    delete(id: string): Promise<boolean>;
    deleteByModelId(modelId: string): Promise<number>;
    existsById(id: string): Promise<boolean>;
    createMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]>;
    updateMany(concepts: CognitiveConcept[]): Promise<CognitiveConcept[]>;
}
//# sourceMappingURL=cognitive-concept-repository-implementation.d.ts.map