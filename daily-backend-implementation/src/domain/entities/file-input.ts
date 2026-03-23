// src/domain/entities/file-input.ts
import { UUID } from '../value-objects/uuid';

/**
 * 文件输入实体
 */
export class FileInput {
  private _id: UUID;
  private _name: string;
  private _type: string;
  private _size: number;
  private _content: string;
  private _metadata: Record<string, any>;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _userId: UUID;

  constructor(
    props: {
      id?: UUID;
      name: string;
      type: string;
      size: number;
      content: string;
      metadata: Record<string, any>;
      createdAt?: Date;
      updatedAt?: Date;
      userId: UUID;
    }
  ) {
    this._id = props.id || UUID.create();
    this._name = props.name;
    this._type = props.type;
    this._size = props.size;
    this._content = props.content;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._userId = props.userId;
  }

  // Getters
  get id(): UUID {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get type(): string {
    return this._type;
  }

  get size(): number {
    return this._size;
  }

  get content(): string {
    return this._content;
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
  updateContent(content: string): void {
    this._content = content;
    this._updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }
}