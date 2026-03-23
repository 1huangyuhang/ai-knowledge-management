"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechRecognitionServiceImpl = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let SpeechRecognitionServiceImpl = class SpeechRecognitionServiceImpl {
    whisperAPIClient;
    supportedTypes = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    constructor(whisperAPIClient) {
        this.whisperAPIClient = whisperAPIClient;
    }
    async recognizeSpeech(speechInput, audioContent) {
        const transcriptionResult = await this.whisperAPIClient.transcribeAudio(audioContent);
        const updatedSpeechInput = speechInput.updateTranscription(transcriptionResult.text, transcriptionResult.confidence || 0, transcriptionResult.language || 'en');
        updatedSpeechInput.updateMetadata({
            transcribed: true,
            transcribedAt: new Date().toISOString()
        });
        return updatedSpeechInput;
    }
    isSupported(audioType) {
        return this.supportedTypes.includes(audioType.toLowerCase());
    }
};
exports.SpeechRecognitionServiceImpl = SpeechRecognitionServiceImpl;
exports.SpeechRecognitionServiceImpl = SpeechRecognitionServiceImpl = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)('WhisperAPIClient')),
    tslib_1.__metadata("design:paramtypes", [Object])
], SpeechRecognitionServiceImpl);
//# sourceMappingURL=SpeechRecognitionService.js.map