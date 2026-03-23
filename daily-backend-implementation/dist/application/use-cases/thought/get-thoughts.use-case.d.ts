import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
export interface GetThoughtsUseCaseInput {
    userId: string;
    isProcessed?: boolean;
    limit?: number;
    offset?: number;
}
export interface GetThoughtsUseCaseOutput {
    thoughtFragments: Array<{
        id: string;
        content: string;
        source: string;
        isProcessed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    totalCount: number;
}
export declare class GetThoughtsUseCase {
    private readonly thoughtFragmentRepository;
    constructor(thoughtFragmentRepository: ThoughtFragmentRepository);
    execute(input: GetThoughtsUseCaseInput): Promise<GetThoughtsUseCaseOutput>;
}
//# sourceMappingURL=get-thoughts.use-case.d.ts.map