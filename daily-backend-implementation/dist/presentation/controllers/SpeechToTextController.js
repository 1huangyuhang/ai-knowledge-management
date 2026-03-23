"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechToTextController = void 0;
const container_1 = require("../../di/container");
class SpeechToTextController {
    audioProcessorService;
    speechRecognitionService;
    audioStorageService;
    constructor() {
        this.audioProcessorService = container_1.container.resolve('AudioProcessorService');
        this.speechRecognitionService = container_1.container.resolve('SpeechRecognitionService');
        this.audioStorageService = container_1.container.resolve('AudioStorageService');
    }
    async speechToText(request, reply) {
        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ success: false, message: 'No audio file uploaded' });
            }
            const audioContent = await data.toBuffer();
            const fileName = data.filename || 'unknown';
            const audioType = fileName.split('.').pop() || 'unknown';
            if (!this.audioProcessorService.isSupported(audioType)) {
                return reply.status(400).send({
                    success: false,
                    message: `Unsupported audio type: ${audioType}`
                });
            }
            const speechInput = await this.audioProcessorService.processAudio(audioContent, audioType);
            const transcribedSpeech = await this.speechRecognitionService.recognizeSpeech(speechInput, audioContent);
            const audioUrl = await this.audioStorageService.saveAudio(transcribedSpeech, audioContent);
            transcribedSpeech.updateMetadata({ audioUrl });
            return reply.send({
                success: true,
                data: {
                    speechId: transcribedSpeech.id,
                    audioUrl,
                    transcription: transcribedSpeech.transcription,
                    confidence: transcribedSpeech.confidence,
                    language: transcribedSpeech.language,
                    duration: transcribedSpeech.duration,
                    metadata: transcribedSpeech.metadata
                }
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to convert speech to text'
            });
        }
    }
    async getSpeechToTextResult(request, reply) {
        try {
            const { speechId } = request.params;
            return reply.send({
                success: true,
                data: {
                    speechId,
                    audioUrl: `http://localhost:3000/api/v1/audio/${speechId}`,
                    transcription: 'This is a sample transcription result.',
                    confidence: 0.95,
                    language: 'en',
                    duration: 10.5,
                    metadata: {
                        originalName: `audio-${speechId}.mp3`,
                        mimeType: 'audio/mpeg',
                        uploadedAt: new Date().toISOString(),
                        processed: true,
                        processedAt: new Date().toISOString(),
                        transcribed: true,
                        transcribedAt: new Date().toISOString()
                    }
                }
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get speech to text result'
            });
        }
    }
}
exports.SpeechToTextController = SpeechToTextController;
//# sourceMappingURL=SpeechToTextController.js.map