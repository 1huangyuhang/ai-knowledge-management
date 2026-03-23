import { WhisperAPIClient } from '../../infrastructure/ai/WhisperAPIClient';
import { SpeechInput } from '../../domain/entities/speech-input';
export interface SpeechRecognitionService {
    recognizeSpeech(speechInput: SpeechInput, audioContent: Buffer): Promise<SpeechInput>;
    isSupported(audioType: string): boolean;
}
export declare class SpeechRecognitionServiceImpl implements SpeechRecognitionService {
    private whisperAPIClient;
    private supportedTypes;
    constructor(whisperAPIClient: WhisperAPIClient);
    recognizeSpeech(speechInput: SpeechInput, audioContent: Buffer): Promise<SpeechInput>;
    isSupported(audioType: string): boolean;
}
//# sourceMappingURL=SpeechRecognitionService.d.ts.map