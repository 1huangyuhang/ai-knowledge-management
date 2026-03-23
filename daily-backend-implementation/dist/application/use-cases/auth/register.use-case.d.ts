import { UserRepository } from '../../../domain/repositories/user-repository';
export interface RegisterUseCaseInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface RegisterUseCaseOutput {
    user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
        fullName: string;
    };
    token: string;
}
export declare class RegisterUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    execute(input: RegisterUseCaseInput): Promise<RegisterUseCaseOutput>;
}
//# sourceMappingURL=register.use-case.d.ts.map