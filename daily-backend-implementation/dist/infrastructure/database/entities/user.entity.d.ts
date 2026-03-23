import { UserRole } from '../../../domain/enums/user-role.enum';
export declare class UserEntity {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.entity.d.ts.map