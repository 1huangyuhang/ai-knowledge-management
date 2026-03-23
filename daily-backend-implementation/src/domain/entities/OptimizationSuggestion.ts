import { UUID } from '../value-objects/UUID';

export enum SuggestionType {
  PERFORMANCE = 'PERFORMANCE',
  READABILITY = 'READABILITY',
  SECURITY = 'SECURITY',
  MAINTAINABILITY = 'MAINTAINABILITY',
  SIZE = 'SIZE',
}

export interface ImpactAssessment {
  performanceImpact: number; // -100 to 100
  readabilityImpact: number; // -100 to 100
  securityImpact: number; // -100 to 100
  maintainabilityImpact: number; // -100 to 100
  sizeImpact: number; // -100 to 100
  overallImpact: number; // -100 to 100
}

export class OptimizationSuggestion {
  constructor(
    private readonly id: UUID,
    private readonly analysisId: UUID,
    private readonly issueId: string,
    private readonly suggestionType: SuggestionType,
    private readonly description: string,
    private readonly implementation: string,
    private readonly expectedImpact: ImpactAssessment,
    private readonly createdAt: Date
  ) {}

  public getId(): UUID {
    return this.id;
  }

  public getAnalysisId(): UUID {
    return this.analysisId;
  }

  public getIssueId(): string {
    return this.issueId;
  }

  public getSuggestionType(): SuggestionType {
    return this.suggestionType;
  }

  public getDescription(): string {
    return this.description;
  }

  public getImplementation(): string {
    return this.implementation;
  }

  public getExpectedImpact(): ImpactAssessment {
    return { ...this.expectedImpact };
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
