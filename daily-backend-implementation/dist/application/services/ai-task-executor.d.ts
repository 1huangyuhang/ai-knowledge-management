import { AITask } from '../../domain/entities/ai-task';
export declare class AITaskExecutor {
    executeTask(task: AITask): Promise<any>;
    private executeFileProcessingTask;
    private executeSpeechProcessingTask;
    private executeCognitiveAnalysisTask;
    private executeEmbeddingGenerationTask;
}
//# sourceMappingURL=ai-task-executor.d.ts.map