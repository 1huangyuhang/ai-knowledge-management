export declare enum SeverityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class CodeIssue {
    private readonly id;
    private readonly ruleId;
    private readonly severity;
    private readonly message;
    private readonly line;
    private readonly column;
    private readonly fixable;
    private readonly suggestion?;
    constructor(id: string, ruleId: string, severity: SeverityLevel, message: string, line: number, column: number, fixable: boolean, suggestion?: string | undefined);
    getId(): string;
    getRuleId(): string;
    getSeverity(): SeverityLevel;
    getMessage(): string;
    getLine(): number;
    getColumn(): number;
    isFixable(): boolean;
    getSuggestion(): string | undefined;
}
//# sourceMappingURL=CodeIssue.d.ts.map