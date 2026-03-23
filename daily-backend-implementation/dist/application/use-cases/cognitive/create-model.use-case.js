"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateModelUseCase = void 0;
const cognitive_model_1 = require("../../../domain/entities/cognitive-model");
const uuid_1 = require("../../../domain/value-objects/uuid");
const cognitive_error_1 = require("../../../domain/errors/cognitive-error");
class CreateModelUseCase {
    cognitiveModelRepository;
    constructor(cognitiveModelRepository) {
        this.cognitiveModelRepository = cognitiveModelRepository;
    }
    async execute(input) {
        if (!input.userId || !input.name || !input.description) {
            throw new cognitive_error_1.CognitiveError('User ID, name and description are required', 'INVALID_INPUT');
        }
        const userId = uuid_1.UUID.fromString(input.userId);
        const cognitiveModel = new cognitive_model_1.CognitiveModel({
            userId,
            name: input.name,
            description: input.description
        });
        const createdModel = await this.cognitiveModelRepository.create(cognitiveModel);
        return {
            model: {
                id: createdModel.getId().getValue(),
                userId: createdModel.getUserId().getValue(),
                name: createdModel.getName(),
                description: createdModel.getDescription(),
                isActive: createdModel.getIsActive(),
                version: createdModel.getVersion(),
                createdAt: createdModel.getCreatedAt(),
                updatedAt: createdModel.getUpdatedAt()
            }
        };
    }
}
exports.CreateModelUseCase = CreateModelUseCase;
//# sourceMappingURL=create-model.use-case.js.map