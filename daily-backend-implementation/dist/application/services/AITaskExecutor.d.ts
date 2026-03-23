import { AITask } from '../../domain/entities/AITask';
export interface IAITaskExecutor {
    executeTask(task: AITask): Promise<any>;
}
export declare class AITaskExecutor implements IAITaskExecutor {
    executeTask(task: AITask): Promise<any>;
    private executeFileProcessingTask;
    private executeSpeechProcessingTask;
    private executeCognitiveAnalysisTask;
    private executeEmbeddingGenerationTask;
    private executeAITask;
}
//# sourceMappingURL=AITaskExecutor.d.ts.map