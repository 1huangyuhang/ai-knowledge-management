import { UUID } from '../value-objects/UUID';
export declare enum SuggestionType {
    PERFORMANCE = "PERFORMANCE",
    READABILITY = "READABILITY",
    SECURITY = "SECURITY",
    MAINTAINABILITY = "MAINTAINABILITY",
    SIZE = "SIZE"
}
export interface ImpactAssessment {
    performanceImpact: number;
    readabilityImpact: number;
    securityImpact: number;
    maintainabilityImpact: number;
    sizeImpact: number;
    overallImpact: number;
}
export declare class OptimizationSuggestion {
    private readonly id;
    private readonly analysisId;
    private readonly issueId;
    private readonly suggestionType;
    private readonly description;
    private readonly implementation;
    private readonly expectedImpact;
    private readonly createdAt;
    constructor(id: UUID, analysisId: UUID, issueId: string, suggestionType: SuggestionType, description: string, implementation: string, expectedImpact: ImpactAssessment, createdAt: Date);
    getId(): UUID;
    getAnalysisId(): UUID;
    getIssueId(): string;
    getSuggestionType(): SuggestionType;
    getDescription(): string;
    getImplementation(): string;
    getExpectedImpact(): ImpactAssessment;
    getCreatedAt(): Date;
}
//# sourceMappingURL=OptimizationSuggestion.d.ts.map