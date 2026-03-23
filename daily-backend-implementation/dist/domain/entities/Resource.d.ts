declare class UUID {
    private _value;
    private constructor();
    get value(): string;
    static create(): UUID;
    static fromString(value: string): UUID;
}
declare abstract class Entity {
    protected _id: UUID;
    constructor(_id: UUID);
    get id(): UUID;
}
export declare enum ResourceType {
    LLM = "LLM",
    EMBEDDING = "EMBEDDING",
    VECTOR_DB = "VECTOR_DB",
    FILE_PROCESSING = "FILE_PROCESSING",
    SPEECH_PROCESSING = "SPEECH_PROCESSING",
    COGNITIVE_MODELING = "COGNITIVE_MODELING"
}
export declare enum ResourceStatus {
    AVAILABLE = "AVAILABLE",
    IN_USE = "IN_USE",
    MAINTENANCE = "MAINTENANCE",
    UNAVAILABLE = "UNAVAILABLE"
}
export declare class Resource extends Entity {
    private _name;
    private _type;
    private _description;
    private _status;
    private _capacity;
    private _usedCapacity;
    private _config;
    private _metadata;
    private _createdAt;
    private _updatedAt;
    private constructor();
    static create(name: string, type: ResourceType, description: string, status: ResourceStatus, capacity: number, config?: Record<string, any>, metadata?: Record<string, any>): Resource;
    update(name?: string, description?: string, status?: ResourceStatus, capacity?: number, config?: Record<string, any>, metadata?: Record<string, any>): void;
    allocate(amount: number): boolean;
    release(amount: number): void;
    reset(): void;
    get usageRate(): number;
    get remainingCapacity(): number;
    get name(): string;
    get type(): ResourceType;
    get description(): string;
    get status(): ResourceStatus;
    get capacity(): number;
    get usedCapacity(): number;
    get config(): Record<string, any>;
    get metadata(): Record<string, any>;
    get createdAt(): Date;
    get updatedAt(): Date;
}
export {};
//# sourceMappingURL=Resource.d.ts.map