import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
export interface CreateThoughtUseCaseInput {
    userId: string;
    content: string;
    source?: string;
}
export interface CreateThoughtUseCaseOutput {
    thoughtFragment: {
        id: string;
        content: string;
        source: string;
        isProcessed: boolean;
        createdAt: Date;
        updatedAt: Date;
        keywords: string[];
    };
}
export declare class CreateThoughtUseCase {
    private readonly thoughtFragmentRepository;
    constructor(thoughtFragmentRepository: ThoughtFragmentRepository);
    execute(input: CreateThoughtUseCaseInput): Promise<CreateThoughtUseCaseOutput>;
}
//# sourceMappingURL=create-thought.use-case.d.ts.map