import { CognitiveConcept } from '../../../../domain/entities/cognitive-concept';
export interface ConceptUpdate {
    id: string;
    before: CognitiveConcept;
    after: CognitiveConcept;
    updatedFields: string[];
}
export interface ConceptDiff {
    added: CognitiveConcept[];
    updated: ConceptUpdate[];
    removed: string[];
}
//# sourceMappingURL=concept-diff.d.ts.map