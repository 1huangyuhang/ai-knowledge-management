import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
export declare enum VisualizationType {
    GRAPH = "graph",
    HIERARCHY = "hierarchy",
    MATRIX = "matrix",
    TIMELINE = "timeline"
}
export interface VisualizationOptions {
    type: VisualizationType;
    includeConcepts?: boolean;
    includeRelations?: boolean;
    includeConfidence?: boolean;
    includeStrength?: boolean;
    includeOccurrenceCount?: boolean;
    nodeSize?: 'small' | 'medium' | 'large';
    edgeThickness?: 'thin' | 'medium' | 'thick';
    colorScheme?: 'default' | 'confidence' | 'strength' | 'occurrence';
    maxNodes?: number;
    maxEdges?: number;
}
export interface VisualizationResult {
    id: string;
    modelId: string;
    type: VisualizationType;
    data: any;
    format: 'json' | 'graphml' | 'svg' | 'png';
    generatedAt: string;
    metadata: {
        generationTime: number;
        nodeCount: number;
        edgeCount: number;
        options: VisualizationOptions;
    };
}
export declare class CognitiveStructureVisualizationService {
    private readonly cognitiveGraphGenerator;
    constructor();
    generateVisualization(model: UserCognitiveModel, options: VisualizationOptions): VisualizationResult;
    private generateHierarchyVisualization;
    private generateMatrixVisualization;
    private generateTimelineVisualization;
    private generateConceptTimeline;
    private generateRelationTimeline;
}
//# sourceMappingURL=CognitiveStructureVisualizationService.d.ts.map