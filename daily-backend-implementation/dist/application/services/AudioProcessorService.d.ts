import { SpeechInput } from '../../domain/entities/speech-input';
export interface AudioProcessorService {
    processAudio(audioContent: Buffer, audioType: string): Promise<SpeechInput>;
    isSupported(audioType: string): boolean;
    getAudioDuration(audioContent: Buffer, audioType: string): Promise<number>;
}
export declare class AudioProcessorServiceImpl implements AudioProcessorService {
    private supportedTypes;
    processAudio(audioContent: Buffer, audioType: string): Promise<SpeechInput>;
    isSupported(audioType: string): boolean;
    getAudioDuration(audioContent: Buffer, audioType: string): Promise<number>;
}
//# sourceMappingURL=AudioProcessorService.d.ts.map