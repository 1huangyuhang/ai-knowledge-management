import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
export interface UpdateModelUseCaseInput {
    userId: string;
    modelId: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}
export interface UpdateModelUseCaseOutput {
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
export declare class UpdateModelUseCase {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    execute(input: UpdateModelUseCaseInput): Promise<UpdateModelUseCaseOutput>;
}
//# sourceMappingURL=update-model.use-case.d.ts.map