"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateProposalUseCase = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_error_1 = require("../../../domain/errors/cognitive-error");
class GenerateProposalUseCase {
    thoughtFragmentRepository;
    constructor(thoughtFragmentRepository) {
        this.thoughtFragmentRepository = thoughtFragmentRepository;
    }
    async execute(input) {
        if (!input.userId || !input.thoughtFragmentIds || input.thoughtFragmentIds.length === 0) {
            throw new cognitive_error_1.CognitiveError('User ID and at least one thought fragment ID are required', 'INVALID_INPUT');
        }
        const userId = uuid_1.UUID.fromString(input.userId);
        const thoughtFragmentIds = input.thoughtFragmentIds.map(id => uuid_1.UUID.fromString(id));
        const selectedThoughtFragments = await this.thoughtFragmentRepository.getByIds(thoughtFragmentIds);
        if (selectedThoughtFragments.length === 0) {
            throw new cognitive_error_1.CognitiveError('No valid thought fragments found', 'THOUGHT_FRAGMENTS_NOT_FOUND');
        }
        const proposal = this.generateMockProposal(userId);
        return {
            proposal
        };
    }
    generateMockProposal(userId) {
        const now = new Date();
        return {
            id: uuid_1.UUID.generate().getValue(),
            userId: userId.getValue(),
            title: '基于思想片段的认知模型提案',
            description: '这是一个由AI生成的认知模型提案，基于您提供的思想片段',
            concepts: [
                {
                    id: uuid_1.UUID.generate().getValue(),
                    name: '认知模型',
                    description: '描述用户认知结构的模型',
                    confidenceScore: 0.9
                },
                {
                    id: uuid_1.UUID.generate().getValue(),
                    name: '思想片段',
                    description: '用户的思想表达片段',
                    confidenceScore: 0.85
                },
                {
                    id: uuid_1.UUID.generate().getValue(),
                    name: 'AI分析',
                    description: 'AI对用户认知的分析',
                    confidenceScore: 0.8
                }
            ],
            relations: [
                {
                    id: uuid_1.UUID.generate().getValue(),
                    sourceConceptId: uuid_1.UUID.generate().getValue(),
                    targetConceptId: uuid_1.UUID.generate().getValue(),
                    type: 'composed_of',
                    confidenceScore: 0.85,
                    description: '认知模型由思想片段组成'
                },
                {
                    id: uuid_1.UUID.generate().getValue(),
                    sourceConceptId: uuid_1.UUID.generate().getValue(),
                    targetConceptId: uuid_1.UUID.generate().getValue(),
                    type: 'influences',
                    confidenceScore: 0.8,
                    description: 'AI分析影响认知模型'
                }
            ],
            createdAt: now,
            updatedAt: now
        };
    }
}
exports.GenerateProposalUseCase = GenerateProposalUseCase;
//# sourceMappingURL=generate-proposal.use-case.js.map