import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
export interface GenerateProposalUseCaseInput {
    userId: string;
    thoughtFragmentIds: string[];
}
export interface GenerateProposalUseCaseOutput {
    proposal: {
        id: string;
        userId: string;
        title: string;
        description: string;
        concepts: Array<{
            id: string;
            name: string;
            description: string;
            confidenceScore: number;
        }>;
        relations: Array<{
            id: string;
            sourceConceptId: string;
            targetConceptId: string;
            type: string;
            confidenceScore: number;
            description: string;
        }>;
        createdAt: Date;
        updatedAt: Date;
    };
}
export declare class GenerateProposalUseCase {
    private readonly thoughtFragmentRepository;
    constructor(thoughtFragmentRepository: ThoughtFragmentRepository);
    execute(input: GenerateProposalUseCaseInput): Promise<GenerateProposalUseCaseOutput>;
    private generateMockProposal;
}
//# sourceMappingURL=generate-proposal.use-case.d.ts.map