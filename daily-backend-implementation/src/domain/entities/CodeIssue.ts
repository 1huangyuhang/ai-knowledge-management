export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CodeIssue {
  constructor(
    private readonly id: string,
    private readonly ruleId: string,
    private readonly severity: SeverityLevel,
    private readonly message: string,
    private readonly line: number,
    private readonly column: number,
    private readonly fixable: boolean,
    private readonly suggestion?: string
  ) {}

  public getId(): string {
    return this.id;
  }

  public getRuleId(): string {
    return this.ruleId;
  }

  public getSeverity(): SeverityLevel {
    return this.severity;
  }

  public getMessage(): string {
    return this.message;
  }

  public getLine(): number {
    return this.line;
  }

  public getColumn(): number {
    return this.column;
  }

  public isFixable(): boolean {
    return this.fixable;
  }

  public getSuggestion(): string | undefined {
    return this.suggestion;
  }
}
