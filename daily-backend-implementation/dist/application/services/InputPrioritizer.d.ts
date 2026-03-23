import { UnifiedInput } from '../adapters/InputAdapter';
export declare class InputPrioritizer {
    assignPriority(input: UnifiedInput): UnifiedInput;
    analyzeInputImportance(input: UnifiedInput): number;
    calculatePriorityScore(input: UnifiedInput): number;
    private calculateTimeFactor;
    private calculateComplexityFactor;
}
//# sourceMappingURL=InputPrioritizer.d.ts.map