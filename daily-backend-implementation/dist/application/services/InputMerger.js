"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputMerger = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class InputMerger {
    mergeInputs(inputs) {
        const mergedInputs = [];
        const processedInputs = new Set();
        for (let i = 0; i < inputs.length; i++) {
            if (processedInputs.has(inputs[i].id)) {
                continue;
            }
            let mergedInput = inputs[i];
            processedInputs.add(inputs[i].id);
            for (let j = i + 1; j < inputs.length; j++) {
                if (processedInputs.has(inputs[j].id)) {
                    continue;
                }
                if (this.isInputsRelated(mergedInput, inputs[j])) {
                    mergedInput = this.mergeTwoInputs(mergedInput, inputs[j]);
                    processedInputs.add(inputs[j].id);
                }
            }
            mergedInputs.push(mergedInput);
        }
        return mergedInputs;
    }
    isInputsRelated(input1, input2) {
        if (input1.metadata.userId !== input2.metadata.userId) {
            return false;
        }
        const timeDiff = Math.abs(input1.createdAt.getTime() - input2.createdAt.getTime());
        if (timeDiff > 5 * 60 * 1000) {
            return false;
        }
        if (input1.metadata.tags && input2.metadata.tags) {
            const commonTags = input1.metadata.tags.filter((tag) => input2.metadata.tags.includes(tag));
            if (commonTags.length > 0) {
                return true;
            }
        }
        return false;
    }
    mergeTwoInputs(input1, input2) {
        return {
            id: crypto_1.default.randomUUID(),
            type: 'merged',
            content: `${input1.content}\n\n${input2.content}`,
            metadata: {
                ...input1.metadata,
                ...input2.metadata,
                sources: [input1.source, input2.source],
                originalIds: [input1.id, input2.id],
                mergedAt: new Date()
            },
            source: 'merged_input',
            createdAt: new Date(Math.min(input1.createdAt.getTime(), input2.createdAt.getTime())),
            priority: Math.max(input1.priority || 0, input2.priority || 0)
        };
    }
    createMergedTask(mergedInput) {
        return {
            type: 'COGNITIVE_ANALYSIS',
            input: mergedInput,
            metadata: {
                merged: true,
                originalInputs: mergedInput.metadata.originalIds || [mergedInput.id],
                inputTypes: mergedInput.metadata.sources || [mergedInput.source]
            }
        };
    }
}
exports.InputMerger = InputMerger;
//# sourceMappingURL=InputMerger.js.map