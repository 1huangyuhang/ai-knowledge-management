import { CognitiveRelation } from '../../../../domain/entities/cognitive-relation';
export interface RelationUpdate {
    id: string;
    before: CognitiveRelation;
    after: CognitiveRelation;
    updatedFields: string[];
}
export interface RelationDiff {
    added: CognitiveRelation[];
    updated: RelationUpdate[];
    removed: string[];
}
//# sourceMappingURL=relation-diff.d.ts.map