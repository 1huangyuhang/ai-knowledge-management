import { UserRepository } from '../../../domain/repositories/user-repository';
export interface LoginUseCaseInput {
    email: string;
    password: string;
}
export interface LoginUseCaseOutput {
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
export declare class LoginUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput>;
}
//# sourceMappingURL=login.use-case.d.ts.map