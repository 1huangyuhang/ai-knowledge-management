"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIWhisperAPIClient = void 0;
const tslib_1 = require("tslib");
const openai_1 = tslib_1.__importDefault(require("openai"));
const fs_1 = tslib_1.__importDefault(require("fs"));
class OpenAIWhisperAPIClient {
    openai;
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        this.openai = new openai_1.default({
            apiKey
        });
    }
    async transcribe(audioPath, language) {
        try {
            if (!fs_1.default.existsSync(audioPath)) {
                throw new Error(`Audio file not found: ${audioPath}`);
            }
            const response = await this.openai.audio.transcriptions.create({
                file: fs_1.default.createReadStream(audioPath),
                model: 'whisper-1',
                language,
                response_format: 'json',
                timestamp_granularities: ['segment'],
                temperature: 0.0
            });
            return {
                text: response.text,
                confidence: response.segments?.[0]?.confidence || 0.9,
                segments: response.segments?.map(segment => ({
                    text: segment.text,
                    start: segment.start,
                    end: segment.end,
                    confidence: segment.confidence
                }))
            };
        }
        catch (error) {
            console.error('Whisper API transcription failed:', error);
            throw new Error(`Whisper API transcription failed: ${error.message}`);
        }
    }
    async translate(audioPath, targetLanguage) {
        try {
            if (!fs_1.default.existsSync(audioPath)) {
                throw new Error(`Audio file not found: ${audioPath}`);
            }
            const response = await this.openai.audio.translations.create({
                file: fs_1.default.createReadStream(audioPath),
                model: 'whisper-1',
                response_format: 'json',
                timestamp_granularities: ['segment'],
                temperature: 0.0
            });
            return {
                text: response.text,
                confidence: response.segments?.[0]?.confidence || 0.9,
                segments: response.segments?.map(segment => ({
                    text: segment.text,
                    start: segment.start,
                    end: segment.end,
                    confidence: segment.confidence
                }))
            };
        }
        catch (error) {
            console.error('Whisper API translation failed:', error);
            throw new Error(`Whisper API translation failed: ${error.message}`);
        }
    }
}
exports.OpenAIWhisperAPIClient = OpenAIWhisperAPIClient;
//# sourceMappingURL=WhisperAPIClient.js.map