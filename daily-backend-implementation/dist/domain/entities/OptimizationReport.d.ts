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
export declare class OptimizationReport {
    private readonly id;
    private readonly projectId;
    private readonly analyses;
    private readonly suggestions;
    private readonly optimizations;
    private readonly summary;
    private readonly createdAt;
    constructor(id: UUID, projectId: string, analyses: CodeAnalysis[], suggestions: OptimizationSuggestion[], optimizations: Optimization[], summary: OptimizationSummary, createdAt: Date);
    getId(): UUID;
    getProjectId(): string;
    getAnalyses(): CodeAnalysis[];
    getSuggestions(): OptimizationSuggestion[];
    getOptimizations(): Optimization[];
    getSummary(): OptimizationSummary;
    getCreatedAt(): Date;
}
//# sourceMappingURL=OptimizationReport.d.ts.map