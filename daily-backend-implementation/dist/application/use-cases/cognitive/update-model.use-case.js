"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModelUseCase = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_error_1 = require("../../../domain/errors/cognitive-error");
class UpdateModelUseCase {
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
        const existingModel = await this.cognitiveModelRepository.getById(modelId);
        if (!existingModel) {
            throw cognitive_error_1.CognitiveError.modelNotFound(modelId.getValue());
        }
        if (!existingModel.getUserId().equals(userId)) {
            throw new cognitive_error_1.CognitiveError('Unauthorized to update this model', 'UNAUTHORIZED');
        }
        if (input.name !== undefined) {
            existingModel.setName(input.name);
        }
        if (input.description !== undefined) {
            existingModel.setDescription(input.description);
        }
        if (input.isActive !== undefined) {
            if (input.isActive) {
                existingModel.activate();
            }
            else {
                existingModel.deactivate();
            }
        }
        const updatedModel = await this.cognitiveModelRepository.update(existingModel);
        return {
            model: {
                id: updatedModel.getId().getValue(),
                userId: updatedModel.getUserId().getValue(),
                name: updatedModel.getName(),
                description: updatedModel.getDescription(),
                isActive: updatedModel.getIsActive(),
                version: updatedModel.getVersion(),
                createdAt: updatedModel.getCreatedAt(),
                updatedAt: updatedModel.getUpdatedAt()
            }
        };
    }
}
exports.UpdateModelUseCase = UpdateModelUseCase;
//# sourceMappingURL=update-model.use-case.js.map