import { UUID } from '../value-objects/uuid';
export declare class CognitiveModel {
    private readonly id;
    private readonly userId;
    private name;
    private description;
    private isActive;
    private readonly createdAt;
    private updatedAt;
    private version;
    constructor(params: {
        id?: UUID;
        userId: UUID;
        name: string;
        description: string;
        isActive?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
        version?: number;
    });
    getId(): UUID;
    getUserId(): UUID;
    getName(): string;
    setName(name: string): void;
    getDescription(): string;
    setDescription(description: string): void;
    getIsActive(): boolean;
    activate(): void;
    deactivate(): void;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getVersion(): number;
    private incrementVersion;
    equals(other: CognitiveModel): boolean;
}
//# sourceMappingURL=cognitive-model.d.ts.map