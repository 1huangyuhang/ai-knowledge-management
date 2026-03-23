import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveRelationType } from '../../domain/entities/cognitive-relation';
export interface CognitiveGraphNode {
    id: string;
    name: string;
    semanticIdentity: string;
    abstractionLevel: number;
    confidence: number;
    occurrenceCount: number;
    centrality?: number;
    metadata: Record<string, any>;
}
export interface CognitiveGraphEdge {
    id: string;
    source: string;
    target: string;
    type: CognitiveRelationType;
    confidence: number;
    strength: number;
    occurrenceCount: number;
    metadata: Record<string, any>;
}
export interface CognitiveGraph {
    id: string;
    modelId: string;
    nodes: CognitiveGraphNode[];
    edges: CognitiveGraphEdge[];
    generatedAt: string;
    metadata: {
        generationTime: number;
        nodeCount: number;
        edgeCount: number;
    };
}
export interface CognitiveGraphOptions {
    maxNodes?: number;
    maxEdges?: number;
    includeAllConcepts?: boolean;
    includeAllRelations?: boolean;
    minConfidenceThreshold?: number;
    minStrengthThreshold?: number;
    filterByConceptIds?: string[];
    filterByRelationTypes?: CognitiveRelationType[];
}
export declare class CognitiveGraphGenerator {
    private readonly defaultOptions;
    generateCognitiveGraph(model: UserCognitiveModel, options?: CognitiveGraphOptions): CognitiveGraph;
    private filterConcepts;
    private filterRelations;
    private calculateCentrality;
}
//# sourceMappingURL=CognitiveGraphGenerator.d.ts.map