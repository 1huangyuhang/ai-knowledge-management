import { CodeIssue } from '../../domain/entities/CodeIssue';
export interface ESLintAnalysisResult {
    success: boolean;
    issues: CodeIssue[];
    metrics: any[];
    stats: {
        errors: number;
        warnings: number;
        files: number;
        time: number;
    };
}
export declare class ESLintAnalyzer {
    private readonly eslintConfigPath;
    constructor();
    analyze(filePath: string): Promise<ESLintAnalysisResult>;
    analyzeMultiple(filePaths: string[]): Promise<Map<string, ESLintAnalysisResult>>;
    private mapESLintSeverity;
}
//# sourceMappingURL=ESLintAnalyzer.d.ts.map