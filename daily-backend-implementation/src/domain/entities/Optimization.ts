import { UUID } from '../value-objects/UUID';

export interface CodeChange {
  filePath: string;
  line: number;
  column: number;
  oldCode: string;
  newCode: string;
  description: string;
}

export interface ValidationResult {
  passed: boolean;
  issues: string[];
  metrics: Record<string, any>;
}

export enum OptimizationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export class Optimization {
  constructor(
    private readonly id: UUID,
    private readonly suggestionId: UUID,
    private status: OptimizationStatus,
    private readonly executedAt: Date,
    private completedAt?: Date,
    private changes: CodeChange[] = [],
    private validationResult?: ValidationResult
  ) {}

  public getId(): UUID {
    return this.id;
  }

  public getSuggestionId(): UUID {
    return this.suggestionId;
  }

  public getStatus(): OptimizationStatus {
    return this.status;
  }

  public setStatus(status: OptimizationStatus): void {
    this.status = status;
  }

  public getExecutedAt(): Date {
    return this.executedAt;
  }

  public getCompletedAt(): Date | undefined {
    return this.completedAt;
  }

  public setCompletedAt(completedAt: Date): void {
    this.completedAt = completedAt;
  }

  public getChanges(): CodeChange[] {
    return [...this.changes];
  }

  public setChanges(changes: CodeChange[]): void {
    this.changes = changes;
  }

  public getValidationResult(): ValidationResult | undefined {
    return this.validationResult;
  }

  public setValidationResult(validationResult: ValidationResult): void {
    this.validationResult = validationResult;
  }
}
