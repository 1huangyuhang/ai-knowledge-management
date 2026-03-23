import { UserCognitiveModel } from '../../domain/entities/user-cognitive-model';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
export interface CognitiveModelingWorkflowConfig {
    updateModel: boolean;
    processRelations: boolean;
    checkConsistency: boolean;
    autoFixConsistency: boolean;
    generateGraph: boolean;
    updateOptions?: any;
    relationProcessorOptions?: any;
    consistencyCheckerOptions?: any;
    graphGeneratorOptions?: any;
}
export interface CognitiveModelingWorkflowResult {
    model: UserCognitiveModel;
    isConsistent: boolean;
    consistencyIssues: any[];
    graph?: any;
    metadata: {
        processingTime: number;
        updateChanges: any;
        relationProcessingChanges: any;
        consistencyFixes: any;
        graphStats: any;
    };
}
export declare class CognitiveModelingWorkflow {
    private readonly cognitiveModelUpdateService;
    private readonly conceptRelationProcessor;
    private readonly modelConsistencyChecker;
    private readonly cognitiveGraphGenerator;
    private readonly defaultConfig;
    constructor();
    execute(model: UserCognitiveModel, thoughtFragment: ThoughtFragment, config?: Partial<CognitiveModelingWorkflowConfig>): Promise<CognitiveModelingWorkflowResult>;
}
//# sourceMappingURL=CognitiveModelingWorkflow.d.ts.map