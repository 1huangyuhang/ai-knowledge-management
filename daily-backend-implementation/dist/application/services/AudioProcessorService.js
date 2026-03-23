"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioProcessorServiceImpl = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const speech_input_1 = require("../../domain/entities/speech-input");
let AudioProcessorServiceImpl = class AudioProcessorServiceImpl {
    supportedTypes = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    async processAudio(audioContent, audioType) {
        if (!this.isSupported(audioType)) {
            throw new Error(`Unsupported audio type: ${audioType}`);
        }
        const duration = await this.getAudioDuration(audioContent, audioType);
        const speechInput = new speech_input_1.SpeechInput({
            audioUrl: '',
            transcription: '',
            confidence: 0,
            language: 'en',
            duration,
            metadata: {
                processed: true,
                processedAt: new Date().toISOString(),
                audioType,
                fileSize: audioContent.length
            }
        });
        return speechInput;
    }
    isSupported(audioType) {
        return this.supportedTypes.includes(audioType.toLowerCase());
    }
    async getAudioDuration(audioContent, audioType) {
        return 10.5;
    }
};
exports.AudioProcessorServiceImpl = AudioProcessorServiceImpl;
exports.AudioProcessorServiceImpl = AudioProcessorServiceImpl = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], AudioProcessorServiceImpl);
//# sourceMappingURL=AudioProcessorService.js.map