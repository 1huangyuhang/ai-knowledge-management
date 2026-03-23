import { CognitiveConcept } from '../entities/cognitive-concept';
export interface CognitiveConceptRepository {
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
//# sourceMappingURL=cognitive-concept-repository.d.ts.map