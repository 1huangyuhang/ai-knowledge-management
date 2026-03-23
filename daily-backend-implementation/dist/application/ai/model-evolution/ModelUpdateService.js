"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIBasedModelUpdateService = void 0;
class AIBasedModelUpdateService {
    llmClient;
    cognitiveParserService;
    relationInferenceService;
    structureValidationService;
    constructor(llmClient, cognitiveParserService, relationInferenceService, structureValidationService) {
        this.llmClient = llmClient;
        this.cognitiveParserService = cognitiveParserService;
        this.relationInferenceService = relationInferenceService;
        this.structureValidationService = structureValidationService;
    }
    async updateModel(request) {
        const { model, newConcepts = [], newRelations = [], updatedConcepts = [], updatedRelations = [], deletedConceptIds = [], deletedRelationIds = [], context } = request;
        return {
            updatedModel: model,
            addedConcepts: newConcepts,
            addedRelations: newRelations,
            updatedConcepts: updatedConcepts,
            updatedRelations: updatedRelations,
            deletedConceptIds: deletedConceptIds,
            deletedRelationIds: deletedRelationIds,
            issues: [],
            recommendations: []
        };
    }
    async updateModelFromText(model, text) {
        const parsingResult = await this.cognitiveParserService.parse(text, model.getId().toString());
        return this.updateModel({
            model,
            newConcepts: parsingResult.concepts,
            newRelations: parsingResult.relations,
            context: text
        });
    }
    async mergeModels(sourceModel, targetModel) {
        return {
            updatedModel: targetModel,
            addedConcepts: [],
            addedRelations: [],
            updatedConcepts: [],
            updatedRelations: [],
            deletedConceptIds: [],
            deletedRelationIds: [],
            issues: [],
            recommendations: []
        };
    }
}
exports.AIBasedModelUpdateService = AIBasedModelUpdateService;
//# sourceMappingURL=ModelUpdateService.js.map