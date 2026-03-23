"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveStructureVisualizationService = exports.VisualizationType = void 0;
const CognitiveGraphGenerator_1 = require("./CognitiveGraphGenerator");
var VisualizationType;
(function (VisualizationType) {
    VisualizationType["GRAPH"] = "graph";
    VisualizationType["HIERARCHY"] = "hierarchy";
    VisualizationType["MATRIX"] = "matrix";
    VisualizationType["TIMELINE"] = "timeline";
})(VisualizationType || (exports.VisualizationType = VisualizationType = {}));
class CognitiveStructureVisualizationService {
    cognitiveGraphGenerator;
    constructor() {
        this.cognitiveGraphGenerator = new CognitiveGraphGenerator_1.CognitiveGraphGenerator();
    }
    generateVisualization(model, options) {
        const startTime = Date.now();
        let visualizationData;
        let format = 'json';
        switch (options.type) {
            case VisualizationType.GRAPH:
                const graph = this.cognitiveGraphGenerator.generateCognitiveGraph(model, {
                    maxNodes: options.maxNodes,
                    maxEdges: options.maxEdges,
                });
                visualizationData = graph;
                break;
            case VisualizationType.HIERARCHY:
                visualizationData = this.generateHierarchyVisualization(model, options);
                break;
            case VisualizationType.MATRIX:
                visualizationData = this.generateMatrixVisualization(model, options);
                break;
            case VisualizationType.TIMELINE:
                visualizationData = this.generateTimelineVisualization(model, options);
                break;
            default:
                throw new Error(`Unsupported visualization type: ${options.type}`);
        }
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            modelId: model.id,
            type: options.type,
            data: visualizationData,
            format,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                nodeCount: model.concepts.length,
                edgeCount: model.relations.length,
                options,
            },
        };
    }
    generateHierarchyVisualization(model, options) {
        const sortedConcepts = [...model.concepts]
            .sort((a, b) => {
            const centralityA = a.metadata.centrality || 0;
            const centralityB = b.metadata.centrality || 0;
            return centralityB - centralityA;
        })
            .slice(0, options.maxNodes || 50);
        const hierarchy = {
            id: 'root',
            name: '认知模型',
            children: sortedConcepts.map(concept => ({
                id: concept.id,
                name: concept.name,
                value: concept.confidence,
                occurrenceCount: concept.occurrenceCount,
                centrality: concept.metadata.centrality,
                children: [],
            })),
        };
        return hierarchy;
    }
    generateMatrixVisualization(model, options) {
        const concepts = [...model.concepts]
            .sort((a, b) => {
            const centralityA = a.metadata.centrality || 0;
            const centralityB = b.metadata.centrality || 0;
            return centralityB - centralityA;
        })
            .slice(0, options.maxNodes || 20);
        const conceptIndex = new Map();
        concepts.forEach((concept, index) => {
            conceptIndex.set(concept.id, index);
        });
        const matrix = Array(concepts.length).fill(0).map(() => Array(concepts.length).fill(0));
        model.relations.forEach(relation => {
            const sourceIndex = conceptIndex.get(relation.sourceConceptId);
            const targetIndex = conceptIndex.get(relation.targetConceptId);
            if (sourceIndex !== undefined && targetIndex !== undefined) {
                matrix[sourceIndex][targetIndex] = relation.strength;
            }
        });
        return {
            concepts: concepts.map(c => c.name),
            matrix,
            metadata: {
                conceptCount: concepts.length,
                relationCount: model.relations.length,
                colorScheme: options.colorScheme,
            },
        };
    }
    generateTimelineVisualization(model, options) {
        const timelineData = {
            modelCreation: model.createdAt.toISOString(),
            modelUpdate: model.updatedAt.toISOString(),
            conceptTimeline: this.generateConceptTimeline(model, options),
            relationTimeline: this.generateRelationTimeline(model, options),
        };
        return timelineData;
    }
    generateConceptTimeline(model, options) {
        const sortedConcepts = [...model.concepts]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .slice(0, options.maxNodes || 50);
        return sortedConcepts.map(concept => ({
            id: concept.id,
            name: concept.name,
            createdAt: concept.createdAt.toISOString(),
            lastOccurrence: concept.lastOccurrence.toISOString(),
            confidence: concept.confidence,
            occurrenceCount: concept.occurrenceCount,
        }));
    }
    generateRelationTimeline(model, options) {
        const sortedRelations = [...model.relations]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .slice(0, options.maxEdges || 50);
        return sortedRelations.map(relation => {
            const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
            const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
            return {
                id: relation.id,
                source: sourceConcept?.name || relation.sourceConceptId,
                target: targetConcept?.name || relation.targetConceptId,
                type: relation.type,
                createdAt: relation.createdAt.toISOString(),
                lastOccurrence: relation.lastOccurrence.toISOString(),
                confidence: relation.confidence,
                strength: relation.strength,
                occurrenceCount: relation.occurrenceCount,
            };
        });
    }
}
exports.CognitiveStructureVisualizationService = CognitiveStructureVisualizationService;
//# sourceMappingURL=CognitiveStructureVisualizationService.js.map