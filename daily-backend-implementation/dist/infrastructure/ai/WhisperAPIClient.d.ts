export interface WhisperTranscriptionResult {
    text: string;
    confidence: number;
    segments?: Array<{
        text: string;
        start: number;
        end: number;
        confidence: number;
    }>;
}
export interface WhisperAPIClient {
    transcribe(audioPath: string, language?: string): Promise<WhisperTranscriptionResult>;
    translate(audioPath: string, targetLanguage: string): Promise<WhisperTranscriptionResult>;
}
export declare class OpenAIWhisperAPIClient implements WhisperAPIClient {
    private readonly openai;
    constructor();
    transcribe(audioPath: string, language?: string): Promise<WhisperTranscriptionResult>;
    translate(audioPath: string, targetLanguage: string): Promise<WhisperTranscriptionResult>;
}
//# sourceMappingURL=WhisperAPIClient.d.ts.map