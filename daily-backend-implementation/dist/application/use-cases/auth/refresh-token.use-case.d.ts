import { UserRepository } from '../../../domain/repositories/user-repository';
export interface RefreshTokenUseCaseInput {
    userId: string;
    refreshToken: string;
}
export interface RefreshTokenUseCaseOutput {
    token: string;
    refreshToken: string;
}
export declare class RefreshTokenUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    execute(input: RefreshTokenUseCaseInput): Promise<RefreshTokenUseCaseOutput>;
}
//# sourceMappingURL=refresh-token.use-case.d.ts.map