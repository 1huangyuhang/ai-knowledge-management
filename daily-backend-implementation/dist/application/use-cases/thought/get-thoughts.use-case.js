"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetThoughtsUseCase = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_error_1 = require("../../../domain/errors/cognitive-error");
class GetThoughtsUseCase {
    thoughtFragmentRepository;
    constructor(thoughtFragmentRepository) {
        this.thoughtFragmentRepository = thoughtFragmentRepository;
    }
    async execute(input) {
        if (!input.userId) {
            throw new cognitive_error_1.CognitiveError('User ID is required', 'INVALID_INPUT');
        }
        const userId = uuid_1.UUID.fromString(input.userId);
        let thoughtFragments;
        if (input.isProcessed !== undefined) {
            thoughtFragments = await this.thoughtFragmentRepository.getByUserId(userId);
            thoughtFragments = thoughtFragments.filter(fragment => fragment.getIsProcessed() === input.isProcessed);
        }
        else {
            thoughtFragments = await this.thoughtFragmentRepository.getByUserId(userId);
        }
        const totalCount = thoughtFragments.length;
        const limit = input.limit || 20;
        const offset = input.offset || 0;
        const paginatedThoughtFragments = thoughtFragments
            .sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime())
            .slice(offset, offset + limit);
        return {
            thoughtFragments: paginatedThoughtFragments.map(fragment => ({
                id: fragment.getId().getValue(),
                content: fragment.getContent(),
                source: fragment.getSource(),
                isProcessed: fragment.getIsProcessed(),
                createdAt: fragment.getCreatedAt(),
                updatedAt: fragment.getUpdatedAt()
            })),
            totalCount
        };
    }
}
exports.GetThoughtsUseCase = GetThoughtsUseCase;
//# sourceMappingURL=get-thoughts.use-case.js.map