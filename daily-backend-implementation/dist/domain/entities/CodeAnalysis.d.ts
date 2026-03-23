import { Entity } from './Entity';
import { CodeMetric } from './CodeMetric';
import { CodeIssue } from './CodeIssue';
import { UUID } from '../value-objects/UUID';
export declare enum AnalysisStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class CodeAnalysis extends Entity {
    private readonly projectId;
    private readonly filePath;
    private metrics;
    private issues;
    private createdAt;
    private analyzedAt;
    private status;
    constructor(id: UUID, projectId: string, filePath: string, metrics: CodeMetric[], issues: CodeIssue[], createdAt: Date, analyzedAt: Date, status: AnalysisStatus);
    getProjectId(): string;
    getFilePath(): string;
    getMetrics(): CodeMetric[];
    setMetrics(metrics: CodeMetric[]): void;
    getIssues(): CodeIssue[];
    setIssues(issues: CodeIssue[]): void;
    getCreatedAt(): Date;
    getAnalyzedAt(): Date;
    setAnalyzedAt(analyzedAt: Date): void;
    getStatus(): AnalysisStatus;
    setStatus(status: AnalysisStatus): void;
}
//# sourceMappingURL=CodeAnalysis.d.ts.map