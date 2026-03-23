import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { UserEntity } from '../entities/user.entity';
export declare class UserRepositoryImpl implements UserRepository {
    private readonly userEntityRepository;
    constructor(userEntityRepository: Repository<UserEntity>);
    private toEntity;
    private toDomain;
    create(user: User): Promise<User>;
    getById(id: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    update(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<User[]>;
    existsByEmail(email: string): Promise<boolean>;
}
//# sourceMappingURL=user-repository-implementation.d.ts.map