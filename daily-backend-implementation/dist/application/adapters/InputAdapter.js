"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAdapter = void 0;
const tslib_1 = require("tslib");
const file_input_1 = require("../../domain/entities/file-input");
const speech_input_1 = require("../../domain/entities/speech-input");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class InputAdapter {
    adaptFileInput(fileInput) {
        return {
            id: fileInput.id,
            type: 'file',
            content: fileInput.content,
            metadata: {
                ...fileInput.metadata,
                fileName: fileInput.name,
                fileType: fileInput.type,
                fileSize: fileInput.size
            },
            source: 'file_upload',
            createdAt: fileInput.createdAt
        };
    }
    adaptSpeechInput(speechInput) {
        return {
            id: speechInput.id,
            type: 'speech',
            content: speechInput.transcription,
            metadata: {
                ...speechInput.metadata,
                audioUrl: speechInput.audioUrl,
                confidence: speechInput.confidence,
                language: speechInput.language,
                duration: speechInput.duration
            },
            source: 'speech_input',
            createdAt: speechInput.createdAt
        };
    }
    adaptTextInput(textInput) {
        return {
            id: textInput.id,
            type: 'text',
            content: textInput.content,
            metadata: {
                ...textInput.metadata,
                tags: textInput.tags
            },
            source: 'text_input',
            createdAt: textInput.createdAt
        };
    }
    normalizeInput(input) {
        if (input instanceof file_input_1.FileInput) {
            return this.adaptFileInput(input);
        }
        else if (input instanceof speech_input_1.SpeechInput) {
            return this.adaptSpeechInput(input);
        }
        else if (input instanceof thought_fragment_1.ThoughtFragment) {
            return this.adaptTextInput(input);
        }
        else {
            return {
                id: input.id || crypto_1.default.randomUUID(),
                type: 'text',
                content: input.content || '',
                metadata: input.metadata || {},
                source: input.source || 'direct_input',
                createdAt: input.createdAt || new Date()
            };
        }
    }
}
exports.InputAdapter = InputAdapter;
//# sourceMappingURL=InputAdapter.js.map