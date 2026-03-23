"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateThoughtUseCase = void 0;
const thought_fragment_1 = require("../../../domain/entities/thought-fragment");
const uuid_1 = require("../../../domain/value-objects/uuid");
const thought_input_validator_1 = require("../../../infrastructure/validators/thought-input.validator");
const thought_input_formatter_1 = require("../../../infrastructure/formatters/thought-input.formatter");
class CreateThoughtUseCase {
    thoughtFragmentRepository;
    constructor(thoughtFragmentRepository) {
        this.thoughtFragmentRepository = thoughtFragmentRepository;
    }
    async execute(input) {
        const validatedInput = thought_input_validator_1.ThoughtInputValidator.validate(input);
        const formattedInput = thought_input_formatter_1.ThoughtInputFormatter.format(validatedInput);
        const keywords = thought_input_formatter_1.ThoughtInputFormatter.extractKeywords(formattedInput.content);
        const thoughtFragment = new thought_fragment_1.ThoughtFragmentImpl(uuid_1.UUID.generate().toString(), formattedInput.content, formattedInput.userId, {
            source: formattedInput.source,
            keywords
        }, false, 0, null, new Date());
        const createdThoughtFragment = await this.thoughtFragmentRepository.create(thoughtFragment);
        return {
            thoughtFragment: {
                id: createdThoughtFragment.id,
                content: createdThoughtFragment.content,
                source: createdThoughtFragment.metadata?.source || 'manual',
                isProcessed: createdThoughtFragment.isProcessed,
                createdAt: createdThoughtFragment.createdAt,
                updatedAt: createdThoughtFragment.updatedAt,
                keywords: createdThoughtFragment.metadata?.keywords || []
            }
        };
    }
}
exports.CreateThoughtUseCase = CreateThoughtUseCase;
//# sourceMappingURL=create-thought.use-case.js.map