import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
export interface GetModelUseCaseInput {
    userId: string;
    modelId: string;
}
export interface GetModelUseCaseOutput {
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
export declare class GetModelUseCase {
    private readonly cognitiveModelRepository;
    constructor(cognitiveModelRepository: CognitiveModelRepository);
    execute(input: GetModelUseCaseInput): Promise<GetModelUseCaseOutput>;
}
//# sourceMappingURL=get-model.use-case.d.ts.map