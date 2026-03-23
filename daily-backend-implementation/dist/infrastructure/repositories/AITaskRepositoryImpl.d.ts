import { AITaskRepository } from '../../domain/repositories/AITaskRepository';
import { AITask } from '../../domain/entities/AITask';
import { DatabaseConnection } from '../database/connection/DatabaseConnection';
export declare class AITaskRepositoryImpl implements AITaskRepository {
    private readonly databaseConnection;
    constructor(databaseConnection: DatabaseConnection);
    private initTable;
    save(task: AITask): Promise<AITask>;
    findById(id: string): Promise<AITask | null>;
    findByStatus(status: string): Promise<AITask[]>;
    findByType(type: string): Promise<AITask[]>;
    findAll(): Promise<AITask[]>;
    delete(id: string): Promise<boolean>;
    update(task: AITask): Promise<AITask>;
    private mapRowToTask;
}
//# sourceMappingURL=AITaskRepositoryImpl.d.ts.map