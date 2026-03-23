export interface User {
    readonly id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    readonly createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    validatePassword(password: string): Promise<boolean>;
    update(updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): void;
    activate(): void;
    deactivate(): void;
}
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class UserImpl implements User {
    readonly id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    readonly createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    constructor(id: string, username: string, email: string, passwordHash: string, role?: UserRole, createdAt?: Date);
    validatePassword(password: string): Promise<boolean>;
    update(updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): void;
    activate(): void;
    deactivate(): void;
}
//# sourceMappingURL=user.d.ts.map