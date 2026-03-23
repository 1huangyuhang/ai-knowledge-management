import { DomainError } from './domain-error';
export declare class CognitiveError extends DomainError {
    constructor(message: string, errorCode: string);
    static modelNotFound(modelId: string): CognitiveError;
    static conceptNotFound(conceptId: string): CognitiveError;
    static relationNotFound(relationId: string): CognitiveError;
    static thoughtFragmentNotFound(fragmentId: string): CognitiveError;
    static insightNotFound(insightId: string): CognitiveError;
    static invalidConfidenceScore(score: number): CognitiveError;
    static invalidPriority(priority: number): CognitiveError;
    static emptyConceptName(): CognitiveError;
    static emptyModelName(): CognitiveError;
    static emptyThoughtContent(): CognitiveError;
    static emptyInsightTitle(): CognitiveError;
    static selfRelationNotAllowed(): CognitiveError;
}
//# sourceMappingURL=cognitive-error.d.ts.map