import { UUID } from '../value-objects/uuid';
export declare class SpeechInput {
    private _id;
    private _audioUrl;
    private _transcription;
    private _confidence;
    private _language;
    private _duration;
    private _metadata;
    private _createdAt;
    private _updatedAt;
    private _userId;
    constructor(props: {
        id?: UUID;
        audioUrl: string;
        transcription: string;
        confidence: number;
        language: string;
        duration: number;
        metadata: Record<string, any>;
        createdAt?: Date;
        updatedAt?: Date;
        userId: UUID;
    });
    get id(): UUID;
    get audioUrl(): string;
    get transcription(): string;
    get confidence(): number;
    get language(): string;
    get duration(): number;
    get metadata(): Record<string, any>;
    get createdAt(): Date;
    get updatedAt(): Date;
    get userId(): UUID;
    updateTranscription(transcription: string, confidence: number): void;
    updateMetadata(metadata: Record<string, any>): void;
}
//# sourceMappingURL=speech-input.d.ts.map