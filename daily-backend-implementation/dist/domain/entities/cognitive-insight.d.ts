import { UUID } from '../value-objects/uuid';
export declare class CognitiveInsight {
    private readonly id;
    private readonly userId;
    private title;
    private description;
    private type;
    private priority;
    private isRead;
    private readonly createdAt;
    private updatedAt;
    constructor(params: {
        id?: UUID;
        userId: UUID;
        title: string;
        description: string;
        type: string;
        priority?: number;
        isRead?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    });
    getId(): UUID;
    getUserId(): UUID;
    getTitle(): string;
    setTitle(title: string): void;
    getDescription(): string;
    setDescription(description: string): void;
    getType(): string;
    setType(type: string): void;
    getPriority(): number;
    setPriority(priority: number): void;
    private validatePriority;
    getIsRead(): boolean;
    markAsRead(): void;
    markAsUnread(): void;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    equals(other: CognitiveInsight): boolean;
}
//# sourceMappingURL=cognitive-insight.d.ts.map