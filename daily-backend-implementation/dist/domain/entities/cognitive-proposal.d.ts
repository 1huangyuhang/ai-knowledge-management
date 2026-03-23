export interface CognitiveProposal {
    readonly id: string;
    readonly thoughtId: string;
    concepts: Array<{
        semanticIdentity: string;
        abstractionLevel: number;
        confidenceScore: number;
        description: string;
    }>;
    relations: Array<{
        sourceSemanticIdentity: string;
        targetSemanticIdentity: string;
        type: string;
        confidenceScore: number;
        description: string;
    }>;
    confidence: number;
    reasoningTrace: string[];
    readonly createdAt: Date;
    isApplied: boolean;
    appliedAt: Date | null;
    appliedBy: string | null;
    markAsApplied(userId: string): void;
    validate(): boolean;
}
export declare class CognitiveProposalImpl implements CognitiveProposal {
    readonly id: string;
    readonly thoughtId: string;
    concepts: Array<{
        semanticIdentity: string;
        abstractionLevel: number;
        confidenceScore: number;
        description: string;
    }>;
    relations: Array<{
        sourceSemanticIdentity: string;
        targetSemanticIdentity: string;
        type: string;
        confidenceScore: number;
        description: string;
    }>;
    confidence: number;
    reasoningTrace: string[];
    readonly createdAt: Date;
    isApplied: boolean;
    appliedAt: Date | null;
    appliedBy: string | null;
    constructor(id: string, thoughtId: string, concepts: CognitiveProposal['concepts'], relations: CognitiveProposal['relations'], confidence: number, reasoningTrace: string[], createdAt?: Date);
    markAsApplied(userId: string): void;
    validate(): boolean;
}
//# sourceMappingURL=cognitive-proposal.d.ts.map