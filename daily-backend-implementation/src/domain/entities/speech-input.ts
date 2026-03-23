// src/domain/entities/speech-input.ts
import { UUID } from '../value-objects/uuid';

/**
 * 语音输入实体
 */
export class SpeechInput {
  private _id: UUID;
  private _audioUrl: string;
  private _transcription: string;
  private _confidence: number;
  private _language: string;
  private _duration: number;
  private _metadata: Record<string, any>;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _userId: UUID;

  constructor(
    props: {
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
    }
  ) {
    this._id = props.id || UUID.create();
    this._audioUrl = props.audioUrl;
    this._transcription = props.transcription;
    this._confidence = props.confidence;
    this._language = props.language;
    this._duration = props.duration;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._userId = props.userId;
  }

  // Getters
  get id(): UUID {
    return this._id;
  }

  get audioUrl(): string {
    return this._audioUrl;
  }

  get transcription(): string {
    return this._transcription;
  }

  get confidence(): number {
    return this._confidence;
  }

  get language(): string {
    return this._language;
  }

  get duration(): number {
    return this._duration;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get userId(): UUID {
    return this._userId;
  }

  // Setters
  updateTranscription(transcription: string, confidence: number): void {
    this._transcription = transcription;
    this._confidence = confidence;
    this._updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }
}