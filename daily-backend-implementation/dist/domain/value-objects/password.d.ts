export declare class Password {
    private readonly value;
    private readonly isHashed;
    constructor(value: string, isHashed?: boolean);
    getValue(): string;
    validate(plainPassword: string): Promise<boolean>;
    private hashPassword;
    equals(other: Password): boolean;
    static isStrongPassword(password: string): boolean;
}
//# sourceMappingURL=password.d.ts.map