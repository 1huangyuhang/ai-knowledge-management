import { UUID } from '../value-objects/uuid';
export declare class FileInput {
    private _id;
    private _name;
    private _type;
    private _size;
    private _content;
    private _metadata;
    private _createdAt;
    private _updatedAt;
    private _userId;
    constructor(props: {
        id?: UUID;
        name: string;
        type: string;
        size: number;
        content: string;
        metadata: Record<string, any>;
        createdAt?: Date;
        updatedAt?: Date;
        userId: UUID;
    });
    get id(): UUID;
    get name(): string;
    get type(): string;
    get size(): number;
    get content(): string;
    get metadata(): Record<string, any>;
    get createdAt(): Date;
    get updatedAt(): Date;
    get userId(): UUID;
    updateContent(content: string): void;
    updateMetadata(metadata: Record<string, any>): void;
}
//# sourceMappingURL=file-input.d.ts.map