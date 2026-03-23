export interface AudioStorageService {
    saveAudio(audio: Buffer, filename: string, mimeType: string): Promise<string>;
    getAudioPath(audioId: string): Promise<string>;
    deleteAudio(audioId: string): Promise<boolean>;
    getAudioUrl(audioId: string): Promise<string>;
    audioExists(audioId: string): Promise<boolean>;
    getAudioMetadata(audioId: string): Promise<{
        filename: string;
        mimeType: string;
        size: number;
        duration?: number;
        sampleRate?: number;
        bitRate?: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare class LocalAudioStorageService implements AudioStorageService {
    private readonly audioDir;
    constructor();
    private ensureAudioDirExists;
    saveAudio(audio: Buffer, filename: string, mimeType: string): Promise<string>;
    private getExtensionFromMimeType;
    getAudioPath(audioId: string): Promise<string>;
    deleteAudio(audioId: string): Promise<boolean>;
    getAudioUrl(audioId: string): Promise<string>;
    audioExists(audioId: string): Promise<boolean>;
    getAudioMetadata(audioId: string): Promise<{
        filename: string;
        mimeType: string;
        size: number;
        duration?: number;
        sampleRate?: number;
        bitRate?: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=AudioStorageService.d.ts.map