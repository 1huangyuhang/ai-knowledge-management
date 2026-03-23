"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputPrioritizer = void 0;
class InputPrioritizer {
    assignPriority(input) {
        const priorityScore = this.calculatePriorityScore(input);
        return {
            ...input,
            priority: priorityScore
        };
    }
    analyzeInputImportance(input) {
        let baseScore = 0;
        switch (input.type) {
            case 'file':
                baseScore = 4;
                break;
            case 'speech':
                baseScore = 3;
                break;
            case 'text':
                baseScore = 2;
                break;
            default:
                baseScore = 2;
        }
        const contentLength = input.content.length;
        if (contentLength > 1000) {
            baseScore += 1;
        }
        else if (contentLength < 100) {
            baseScore -= 1;
        }
        if (input.metadata?.priority) {
            baseScore = Math.max(baseScore, input.metadata.priority);
        }
        return Math.max(1, Math.min(5, baseScore));
    }
    calculatePriorityScore(input) {
        const importanceScore = this.analyzeInputImportance(input);
        const timeFactor = this.calculateTimeFactor(input.createdAt);
        const complexityFactor = this.calculateComplexityFactor(input);
        const priorityScore = importanceScore * 15 + timeFactor * 35 + complexityFactor * 50;
        return Math.max(0, Math.min(100, Math.round(priorityScore)));
    }
    calculateTimeFactor(createdAt) {
        const now = new Date();
        const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) {
            return 1.0;
        }
        else if (diffInHours < 24) {
            return 0.7;
        }
        else if (diffInHours < 168) {
            return 0.4;
        }
        else {
            return 0.1;
        }
    }
    calculateComplexityFactor(input) {
        const content = input.content;
        const wordCount = content.split(/\s+/).length;
        const uniqueWords = new Set(content.split(/\s+/)).size;
        const sentenceCount = (content.match(/[.!?]+/g) || []).length + 1;
        let complexity = 0;
        if (wordCount > 1000) {
            complexity += 0.4;
        }
        else if (wordCount > 500) {
            complexity += 0.3;
        }
        else if (wordCount > 100) {
            complexity += 0.2;
        }
        const lexicalDiversity = uniqueWords / wordCount;
        if (lexicalDiversity > 0.8) {
            complexity += 0.3;
        }
        else if (lexicalDiversity > 0.5) {
            complexity += 0.2;
        }
        else if (lexicalDiversity > 0.3) {
            complexity += 0.1;
        }
        if (sentenceCount > 50) {
            complexity += 0.3;
        }
        else if (sentenceCount > 20) {
            complexity += 0.2;
        }
        else if (sentenceCount > 5) {
            complexity += 0.1;
        }
        return Math.min(1.0, complexity);
    }
}
exports.InputPrioritizer = InputPrioritizer;
//# sourceMappingURL=InputPrioritizer.js.map