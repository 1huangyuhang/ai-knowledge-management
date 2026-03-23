export declare class UUID {
    private readonly _value;
    private constructor();
    get value(): string;
    static generate(): UUID;
    static fromString(value: string): UUID;
    static isValid(value: string): boolean;
    equals(other: UUID): boolean;
    toString(): string;
}
//# sourceMappingURL=uuid.d.ts.map