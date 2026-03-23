import { Repository } from 'typeorm';
import { CognitiveModel } from '../../../domain/entities/cognitive-model';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveModelEntity } from '../entities/cognitive-model.entity';
export declare class CognitiveModelRepositoryImpl implements CognitiveModelRepository {
    private readonly cognitiveModelEntityRepository;
    constructor(cognitiveModelEntityRepository: Repository<CognitiveModelEntity>);
    private toEntity;
    private toDomain;
    create(model: CognitiveModel): Promise<CognitiveModel>;
    getById(id: string): Promise<CognitiveModel | null>;
    getByUserId(userId: string): Promise<CognitiveModel[]>;
    update(model: CognitiveModel): Promise<CognitiveModel>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    getActiveModelByUserId(userId: string): Promise<CognitiveModel | null>;
}
//# sourceMappingURL=cognitive-model-repository-implementation.d.ts.map