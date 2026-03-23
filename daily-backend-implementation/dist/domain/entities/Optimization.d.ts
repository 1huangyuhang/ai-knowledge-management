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
export declare enum OptimizationStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    ROLLED_BACK = "ROLLED_BACK"
}
export declare class Optimization {
    private readonly id;
    private readonly suggestionId;
    private status;
    private readonly executedAt;
    private completedAt?;
    private changes;
    private validationResult?;
    constructor(id: UUID, suggestionId: UUID, status: OptimizationStatus, executedAt: Date, completedAt?: Date | undefined, changes?: CodeChange[], validationResult?: ValidationResult | undefined);
    getId(): UUID;
    getSuggestionId(): UUID;
    getStatus(): OptimizationStatus;
    setStatus(status: OptimizationStatus): void;
    getExecutedAt(): Date;
    getCompletedAt(): Date | undefined;
    setCompletedAt(completedAt: Date): void;
    getChanges(): CodeChange[];
    setChanges(changes: CodeChange[]): void;
    getValidationResult(): ValidationResult | undefined;
    setValidationResult(validationResult: ValidationResult): void;
}
//# sourceMappingURL=Optimization.d.ts.map