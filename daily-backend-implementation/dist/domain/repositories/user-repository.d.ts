import { User } from '../entities/user';
export interface UserRepository {
    create(user: User): Promise<User>;
    getById(id: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    update(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<User[]>;
    existsByEmail(email: string): Promise<boolean>;
}
//# sourceMappingURL=user-repository.d.ts.map