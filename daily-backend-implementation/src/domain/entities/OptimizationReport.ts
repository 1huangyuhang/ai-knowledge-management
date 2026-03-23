import { UUID } from '../value-objects/UUID';
import { CodeAnalysis } from './CodeAnalysis';
import { OptimizationSuggestion } from './OptimizationSuggestion';
import { Optimization } from './Optimization';

export interface OptimizationSummary {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  fixedIssues: number;
  improvementPercentage: number;
  performanceImprovement: number;
  readabilityImprovement: number;
  securityImprovement: number;
  maintainabilityImprovement: number;
  sizeImprovement: number;
  totalChanges: number;
  filesModified: number;
}

export class OptimizationReport {
  constructor(
    private readonly id: UUID,
    private readonly projectId: string,
    private readonly analyses: CodeAnalysis[],
    private readonly suggestions: OptimizationSuggestion[],
    private readonly optimizations: Optimization[],
    private readonly summary: OptimizationSummary,
    private readonly createdAt: Date
  ) {}

  public getId(): UUID {
    return this.id;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getAnalyses(): CodeAnalysis[] {
    return [...this.analyses];
  }

  public getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions];
  }

  public getOptimizations(): Optimization[] {
    return [...this.optimizations];
  }

  public getSummary(): OptimizationSummary {
    return { ...this.summary };
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
