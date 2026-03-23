"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetModelUseCase = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_error_1 = require("../../../domain/errors/cognitive-error");
class GetModelUseCase {
    cognitiveModelRepository;
    constructor(cognitiveModelRepository) {
        this.cognitiveModelRepository = cognitiveModelRepository;
    }
    async execute(input) {
        if (!input.userId || !input.modelId) {
            throw new cognitive_error_1.CognitiveError('User ID and model ID are required', 'INVALID_INPUT');
        }
        const userId = uuid_1.UUID.fromString(input.userId);
        const modelId = uuid_1.UUID.fromString(input.modelId);
        const cognitiveModel = await this.cognitiveModelRepository.getById(modelId);
        if (!cognitiveModel) {
            throw cognitive_error_1.CognitiveError.modelNotFound(modelId.getValue());
        }
        if (!cognitiveModel.getUserId().equals(userId)) {
            throw new cognitive_error_1.CognitiveError('Unauthorized to access this model', 'UNAUTHORIZED');
        }
        return {
            model: {
                id: cognitiveModel.getId().getValue(),
                userId: cognitiveModel.getUserId().getValue(),
                name: cognitiveModel.getName(),
                description: cognitiveModel.getDescription(),
                isActive: cognitiveModel.getIsActive(),
                version: cognitiveModel.getVersion(),
                createdAt: cognitiveModel.getCreatedAt(),
                updatedAt: cognitiveModel.getUpdatedAt()
            }
        };
    }
}
exports.GetModelUseCase = GetModelUseCase;
//# sourceMappingURL=get-model.use-case.js.map