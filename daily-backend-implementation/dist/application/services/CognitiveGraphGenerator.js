"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveGraphGenerator = void 0;
class CognitiveGraphGenerator {
    defaultOptions = {
        maxNodes: 100,
        maxEdges: 200,
        includeAllConcepts: false,
        includeAllRelations: false,
        minConfidenceThreshold: 0.3,
        minStrengthThreshold: 0.2,
    };
    generateCognitiveGraph(model, options = {}) {
        const startTime = Date.now();
        const mergedOptions = { ...this.defaultOptions, ...options };
        const concepts = model.concepts;
        const relations = model.relations;
        const filteredConcepts = this.filterConcepts(concepts, mergedOptions);
        const conceptIdsToInclude = new Set(filteredConcepts.map(c => c.id));
        const filteredRelations = this.filterRelations(relations, mergedOptions)
            .filter(relation => conceptIdsToInclude.has(relation.sourceConceptId) &&
            conceptIdsToInclude.has(relation.targetConceptId));
        const nodes = filteredConcepts.map(concept => ({
            id: concept.id,
            name: concept.name,
            semanticIdentity: concept.name,
            abstractionLevel: 0,
            confidence: concept.confidence,
            occurrenceCount: concept.occurrenceCount,
            centrality: concept.metadata.centrality,
            metadata: { ...concept.metadata },
        }));
        const edges = filteredRelations.map(relation => ({
            id: relation.id,
            source: relation.sourceConceptId,
            target: relation.targetConceptId,
            type: relation.type,
            confidence: relation.confidence,
            strength: relation.strength,
            occurrenceCount: relation.occurrenceCount,
            metadata: { ...relation.metadata },
        }));
        const nodesWithCentrality = this.calculateCentrality(nodes, edges);
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            modelId: model.id,
            nodes: nodesWithCentrality,
            edges,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                nodeCount: nodesWithCentrality.length,
                edgeCount: edges.length,
            },
        };
    }
    filterConcepts(concepts, options) {
        let filtered = [...concepts];
        if (options.minConfidenceThreshold !== undefined) {
            filtered = filtered.filter(concept => concept.confidence >= options.minConfidenceThreshold);
        }
        if (options.filterByConceptIds) {
            filtered = filtered.filter(concept => options.filterByConceptIds.includes(concept.id));
        }
        if (!options.includeAllConcepts && options.maxNodes !== undefined && filtered.length > options.maxNodes) {
            filtered = filtered
                .sort((a, b) => {
                const centralityA = a.metadata.centrality || 0;
                const centralityB = b.metadata.centrality || 0;
                if (centralityA !== centralityB)
                    return centralityB - centralityA;
                return b.confidence - a.confidence;
            })
                .slice(0, options.maxNodes);
        }
        return filtered;
    }
    filterRelations(relations, options) {
        let filtered = [...relations];
        if (options.minConfidenceThreshold !== undefined) {
            filtered = filtered.filter(relation => relation.confidence >= options.minConfidenceThreshold);
        }
        if (options.minStrengthThreshold !== undefined) {
            filtered = filtered.filter(relation => relation.strength >= options.minStrengthThreshold);
        }
        if (options.filterByRelationTypes) {
            filtered = filtered.filter(relation => options.filterByRelationTypes.includes(relation.type));
        }
        if (!options.includeAllRelations && options.maxEdges !== undefined && filtered.length > options.maxEdges) {
            filtered = filtered
                .sort((a, b) => {
                if (a.strength !== b.strength)
                    return b.strength - a.strength;
                return b.confidence - a.confidence;
            })
                .slice(0, options.maxEdges);
        }
        return filtered;
    }
    calculateCentrality(nodes, edges) {
        const degreeMap = new Map();
        nodes.forEach(node => degreeMap.set(node.id, 0));
        edges.forEach(edge => {
            degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
            degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
        });
        const maxDegree = Math.max(...Array.from(degreeMap.values()), 1);
        return nodes.map(node => ({
            ...node,
            centrality: (degreeMap.get(node.id) || 0) / maxDegree,
        }));
    }
}
exports.CognitiveGraphGenerator = CognitiveGraphGenerator;
//# sourceMappingURL=CognitiveGraphGenerator.js.map