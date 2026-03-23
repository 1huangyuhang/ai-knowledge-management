import { Entity } from './Entity';
import { CodeMetric } from './CodeMetric';
import { CodeIssue } from './CodeIssue';
import { UUID } from '../value-objects/UUID';

export enum AnalysisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CodeAnalysis extends Entity {
  constructor(
    id: UUID,
    private readonly projectId: string,
    private readonly filePath: string,
    private metrics: CodeMetric[],
    private issues: CodeIssue[],
    private createdAt: Date,
    private analyzedAt: Date,
    private status: AnalysisStatus
  ) {
    super(id);
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getFilePath(): string {
    return this.filePath;
  }

  public getMetrics(): CodeMetric[] {
    return [...this.metrics];
  }

  public setMetrics(metrics: CodeMetric[]): void {
    this.metrics = metrics;
  }

  public getIssues(): CodeIssue[] {
    return [...this.issues];
  }

  public setIssues(issues: CodeIssue[]): void {
    this.issues = issues;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getAnalyzedAt(): Date {
    return this.analyzedAt;
  }

  public setAnalyzedAt(analyzedAt: Date): void {
    this.analyzedAt = analyzedAt;
  }

  public getStatus(): AnalysisStatus {
    return this.status;
  }

  public setStatus(status: AnalysisStatus): void {
    this.status = status;
  }
}
