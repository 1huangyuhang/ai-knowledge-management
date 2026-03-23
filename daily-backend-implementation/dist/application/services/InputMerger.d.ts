import { UnifiedInput } from '../adapters/InputAdapter';
export declare class InputMerger {
    mergeInputs(inputs: UnifiedInput[]): UnifiedInput[];
    isInputsRelated(input1: UnifiedInput, input2: UnifiedInput): boolean;
    private mergeTwoInputs;
    createMergedTask(mergedInput: UnifiedInput): any;
}
//# sourceMappingURL=InputMerger.d.ts.map