import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
export declare enum ConsistencyIssueType {
    MISSING_CONCEPT = "missingConcept",
    DUPLICATE_CONCEPT = "duplicateConcept",
    SELF_REFERENTIAL_RELATION = "selfReferentialRelation",
    INVALID_RELATION_TYPE = "invalidRelationType",
    LOW_CONFIDENCE_CONCEPT = "lowConfidenceConcept",
    LOW_CONFIDENCE_RELATION = "lowConfidenceRelation",
    ISOLATED_CONCEPT = "isolatedConcept"
}
export interface ConsistencyIssue {
    type: ConsistencyIssueType;
    severity: 'low' | 'medium' | 'high';
    message: string;
    affectedEntityId?: string;
    suggestedFix?: string;
}
export interface ModelConsistencyResult {
    isConsistent: boolean;
    issues: ConsistencyIssue[];
    metadata: {
        totalIssues: number;
        highSeverityIssues: number;
        mediumSeverityIssues: number;
        lowSeverityIssues: number;
        conceptCount: number;
        relationCount: number;
        processingTime: number;
    };
}
export declare class ModelConsistencyChecker {
    private readonly validRelationTypes;
    private readonly minimumConfidenceThreshold;
    checkConsistency(model: UserCognitiveModel): ModelConsistencyResult;
    private checkConceptConsistency;
    private checkRelationConsistency;
    private checkIsolatedConcepts;
    autoFixConsistencyIssues(model: UserCognitiveModel, issues: ConsistencyIssue[]): {
        model: UserCognitiveModel;
        fixedIssues: number;
        remainingIssues: ConsistencyIssue[];
    };
}
//# sourceMappingURL=ModelConsistencyChecker.d.ts.map