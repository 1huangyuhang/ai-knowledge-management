"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtInputValidator = void 0;
const cognitive_error_1 = require("../../domain/errors/cognitive-error");
class ThoughtInputValidator {
    static validate(input) {
        if (!input.userId) {
            throw new cognitive_error_1.CognitiveError('User ID is required', 'INVALID_INPUT');
        }
        if (!input.content || input.content.trim().length === 0) {
            throw cognitive_error_1.CognitiveError.emptyThoughtContent();
        }
        if (input.content.length > 10000) {
            throw new cognitive_error_1.CognitiveError('Content length cannot exceed 10000 characters', 'INVALID_INPUT');
        }
        if (input.source && input.source.length > 100) {
            throw new cognitive_error_1.CognitiveError('Source length cannot exceed 100 characters', 'INVALID_INPUT');
        }
        return {
            userId: input.userId.trim(),
            content: input.content.trim(),
            source: input.source?.trim() || 'manual'
        };
    }
}
exports.ThoughtInputValidator = ThoughtInputValidator;
//# sourceMappingURL=thought-input.validator.js.map