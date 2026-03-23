import { CognitiveRelation } from '../entities/cognitive-relation';
import { CognitiveRelationType } from '../entities/cognitive-relation';
export interface CognitiveRelationRepository {
    create(relation: CognitiveRelation): Promise<CognitiveRelation>;
    getById(id: string): Promise<CognitiveRelation | null>;
    getByModelId(modelId: string): Promise<CognitiveRelation[]>;
    getByConceptId(conceptId: string): Promise<CognitiveRelation[]>;
    getByConceptIdAndType(conceptId: string, type: CognitiveRelationType): Promise<CognitiveRelation[]>;
    getByThoughtId(thoughtId: string): Promise<CognitiveRelation[]>;
    update(relation: CognitiveRelation): Promise<CognitiveRelation>;
    delete(id: string): Promise<boolean>;
    deleteByModelId(modelId: string): Promise<number>;
    deleteByConceptId(conceptId: string): Promise<number>;
    existsById(id: string): Promise<boolean>;
    createMany(relations: CognitiveRelation[]): Promise<CognitiveRelation[]>;
    updateMany(relations: CognitiveRelation[]): Promise<CognitiveRelation[]>;
}
//# sourceMappingURL=cognitive-relation-repository.d.ts.map