import { CognitiveModel } from '../entities/cognitive-model';
export interface CognitiveModelRepository {
    create(model: CognitiveModel): Promise<CognitiveModel>;
    getById(id: string): Promise<CognitiveModel | null>;
    getByUserId(userId: string): Promise<CognitiveModel[]>;
    update(model: CognitiveModel): Promise<CognitiveModel>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    getActiveModelByUserId(userId: string): Promise<CognitiveModel | null>;
}
//# sourceMappingURL=cognitive-model-repository.d.ts.map