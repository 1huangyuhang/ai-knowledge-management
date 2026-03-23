import { CognitiveModel } from '../../../domain/entities';
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { CognitiveParserService } from '../cognitive-parsing/CognitiveParserService';
import { RelationInferenceService } from '../relation-inference/RelationInferenceService';
import { StructureValidationService } from '../structure-validation/StructureValidationService';
export interface ModelUpdateRequest {
    model: CognitiveModel;
    newConcepts?: CognitiveConcept[];
    newRelations?: CognitiveRelation[];
    updatedConcepts?: CognitiveConcept[];
    updatedRelations?: CognitiveRelation[];
    deletedConceptIds?: string[];
    deletedRelationIds?: string[];
    context?: string;
}
export interface ModelUpdateResult {
    updatedModel: CognitiveModel;
    addedConcepts: CognitiveConcept[];
    addedRelations: CognitiveRelation[];
    updatedConcepts: CognitiveConcept[];
    updatedRelations: CognitiveRelation[];
    deletedConceptIds: string[];
    deletedRelationIds: string[];
    issues: string[];
    recommendations: string[];
}
export interface ModelUpdateService {
    updateModel(request: ModelUpdateRequest): Promise<ModelUpdateResult>;
    updateModelFromText(model: CognitiveModel, text: string): Promise<ModelUpdateResult>;
    mergeModels(sourceModel: CognitiveModel, targetModel: CognitiveModel): Promise<ModelUpdateResult>;
}
export declare class AIBasedModelUpdateService implements ModelUpdateService {
    private readonly llmClient;
    private readonly cognitiveParserService;
    private readonly relationInferenceService;
    private readonly structureValidationService;
    constructor(llmClient: LLMClient, cognitiveParserService: CognitiveParserService, relationInferenceService: RelationInferenceService, structureValidationService: StructureValidationService);
    updateModel(request: ModelUpdateRequest): Promise<ModelUpdateResult>;
    updateModelFromText(model: CognitiveModel, text: string): Promise<ModelUpdateResult>;
    mergeModels(sourceModel: CognitiveModel, targetModel: CognitiveModel): Promise<ModelUpdateResult>;
}
//# sourceMappingURL=ModelUpdateService.d.ts.map