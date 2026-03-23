"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtInputFormatter = void 0;
class ThoughtInputFormatter {
    static format(input) {
        const formattedInput = {
            userId: input.userId.trim(),
            content: input.content.trim(),
            source: input.source?.trim() || 'manual'
        };
        formattedInput.content = formattedInput.content.replace(/\r\n/g, '\n');
        formattedInput.content = formattedInput.content.replace(/\n{3,}/g, '\n\n');
        return formattedInput;
    }
    static extractKeywords(content) {
        const words = content.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'all', 'any', 'some', 'no', 'not', 'only', 'such', 'own', 'same', 'that', 'those', 'this', 'these', 'every', 'each', 'other', 'another', 'more', 'less', 'most', 'least', 'so', 'than', 'too', 'very', 'just', 'enough', 'now', 'then', 'here', 'there', 'when', 'where', 'why', 'how', 'who', 'whom', 'whose', 'which', 'what']);
        const keywords = words
            .filter(word => !stopWords.has(word) && word.length > 2)
            .reduce((acc, word) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
            if (cleanWord && !acc.includes(cleanWord)) {
                acc.push(cleanWord);
            }
            return acc;
        }, []);
        return keywords.slice(0, 10);
    }
}
exports.ThoughtInputFormatter = ThoughtInputFormatter;
//# sourceMappingURL=thought-input.formatter.js.map