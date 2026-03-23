import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
export interface CreateModelUseCaseInput {
    userId: string;
    name: string;
    description: string;
}
export interface CreateModelUseCaseOutput {
    model: {
        id: string;
        userId: string;
        name: string;
        description: string;
        isActive: boolean;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    };
}
export declare class CreateModelUseCase {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    execute(input: CreateModelUseCaseInput): Promise<CreateModelUseCaseOutput>;
}
//# sourceMappingURL=create-model.use-case.d.ts.map