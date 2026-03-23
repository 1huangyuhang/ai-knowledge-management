"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveError = void 0;
const domain_error_1 = require("./domain-error");
class CognitiveError extends domain_error_1.DomainError {
    constructor(message, errorCode) {
        super(message, errorCode);
        this.name = 'CognitiveError';
        Object.setPrototypeOf(this, CognitiveError.prototype);
    }
    static modelNotFound(modelId) {
        return new CognitiveError(`Cognitive model with ID ${modelId} not found`, 'MODEL_NOT_FOUND');
    }
    static conceptNotFound(conceptId) {
        return new CognitiveError(`Cognitive concept with ID ${conceptId} not found`, 'CONCEPT_NOT_FOUND');
    }
    static relationNotFound(relationId) {
        return new CognitiveError(`Cognitive relation with ID ${relationId} not found`, 'RELATION_NOT_FOUND');
    }
    static thoughtFragmentNotFound(fragmentId) {
        return new CognitiveError(`Thought fragment with ID ${fragmentId} not found`, 'THOUGHT_FRAGMENT_NOT_FOUND');
    }
    static insightNotFound(insightId) {
        return new CognitiveError(`Cognitive insight with ID ${insightId} not found`, 'INSIGHT_NOT_FOUND');
    }
    static invalidConfidenceScore(score) {
        return new CognitiveError(`Confidence score ${score} must be between 0 and 1`, 'INVALID_CONFIDENCE_SCORE');
    }
    static invalidPriority(priority) {
        return new CognitiveError(`Priority ${priority} must be between 1 and 5`, 'INVALID_PRIORITY');
    }
    static emptyConceptName() {
        return new CognitiveError('Concept name cannot be empty', 'EMPTY_CONCEPT_NAME');
    }
    static emptyModelName() {
        return new CognitiveError('Cognitive model name cannot be empty', 'EMPTY_MODEL_NAME');
    }
    static emptyThoughtContent() {
        return new CognitiveError('Thought fragment content cannot be empty', 'EMPTY_THOUGHT_CONTENT');
    }
    static emptyInsightTitle() {
        return new CognitiveError('Insight title cannot be empty', 'EMPTY_INSIGHT_TITLE');
    }
    static selfRelationNotAllowed() {
        return new CognitiveError('Cannot create relation between a concept and itself', 'SELF_RELATION_NOT_ALLOWED');
    }
}
exports.CognitiveError = CognitiveError;
//# sourceMappingURL=cognitive-error.js.map