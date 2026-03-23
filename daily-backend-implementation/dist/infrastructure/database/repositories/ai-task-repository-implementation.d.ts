import { Repository } from 'typeorm';
import { AITask } from '../../../domain/entities/AITask';
import { AITaskRepository } from '../../../domain/repositories/AITaskRepository';
import { AITaskEntity } from '../entities/ai-task.entity';
import { UUID } from '../../../domain/value-objects/UUID';
import { AITaskStatus, AITaskPriority, AITaskType } from '../../../domain/entities/AITask';
export declare class AITaskRepositoryImpl implements AITaskRepository {
    private readonly aiTaskEntityRepository;
    constructor(aiTaskEntityRepository: Repository<AITaskEntity>);
    private toEntity;
    private toDomain;
    save(task: AITask): Promise<AITask>;
    findById(id: UUID): Promise<AITask | null>;
    findAll(): Promise<AITask[]>;
    findByStatus(status: AITaskStatus, limit?: number, offset?: number): Promise<AITask[]>;
    findByPriority(priority: AITaskPriority, limit?: number, offset?: number): Promise<AITask[]>;
    findByType(type: AITaskType, limit?: number, offset?: number): Promise<AITask[]>;
    findByUserId(userId: UUID, limit?: number, offset?: number): Promise<AITask[]>;
    findByCognitiveModelId(cognitiveModelId: UUID, limit?: number, offset?: number): Promise<AITask[]>;
    findByIds(ids: UUID[]): Promise<AITask[]>;
    updateStatus(id: UUID, status: AITaskStatus): Promise<AITask>;
    updatePriority(id: UUID, priority: AITaskPriority): Promise<AITask>;
    delete(id: UUID): Promise<boolean>;
    deleteAll(): Promise<number>;
    deleteByStatus(status: AITaskStatus): Promise<number>;
    count(): Promise<number>;
    countByStatus(status: AITaskStatus): Promise<number>;
    countByType(type: AITaskType): Promise<number>;
    findExpiredTasks(threshold: number): Promise<AITask[]>;
    findPendingTasks(limit?: number): Promise<AITask[]>;
}
//# sourceMappingURL=ai-task-repository-implementation.d.ts.map