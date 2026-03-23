import { ThoughtFragment } from '../domain/entities/thought-fragment';
import { CognitiveConcept } from '../domain/entities/cognitive-concept';
export declare class TestDataGenerator {
    static generateThoughtFragment(overrides?: Partial<ThoughtFragment>): ThoughtFragment;
    static generateCognitiveConcept(overrides?: Partial<CognitiveConcept>): CognitiveConcept;
    static generateThoughtFragments(count: number): ThoughtFragment[];
    static generateCognitiveConcepts(count: number): CognitiveConcept[];
}
//# sourceMappingURL=test-data-generator.d.ts.map