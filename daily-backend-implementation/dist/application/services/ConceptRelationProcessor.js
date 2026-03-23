"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptRelationProcessor = void 0;
class ConceptRelationProcessor {
    cacheService;
    defaultOptions = {
        relationType: 'association',
        minimumConfidence: 0.3,
        minimumStrength: 0.2,
    };
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async processConceptRelations(concepts, relations, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        const processedConcepts = [...concepts];
        let processedRelations = [...relations];
        const originalRelationCount = processedRelations.length;
        processedRelations = processedRelations.filter(relation => {
            return (relation.confidence >= mergedOptions.minimumConfidence &&
                relation.strength >= mergedOptions.minimumStrength);
        });
        const originalConceptCount = processedConcepts.length;
        const relatedConceptIds = new Set();
        processedRelations.forEach(relation => {
            relatedConceptIds.add(relation.sourceConceptId);
            relatedConceptIds.add(relation.targetConceptId);
        });
        processedConcepts = processedConcepts.filter(concept => {
            return relatedConceptIds.has(concept.id);
        });
        processedRelations = processedRelations.map(relation => {
            return new cognitive_relation_1.CognitiveRelation({
                ...relation,
                type: mergedOptions.relationType,
            });
        });
        return {
            concepts: processedConcepts,
            relations: processedRelations,
            metadata: {
                processedConcepts: originalConceptCount,
                processedRelations: originalRelationCount,
                filteredConcepts: originalConceptCount - processedConcepts.length,
                filteredRelations: originalRelationCount - processedRelations.length,
            },
        };
    }
    async calculateConceptSimilarity(concept1, concept2) {
        const [name1, name2] = [concept1.name, concept2.name].sort();
        const cacheKey = `similarity:${name1.toLowerCase()}:${name2.toLowerCase()}`;
        if (this.cacheService) {
            const cachedSimilarity = await this.cacheService.get(cacheKey);
            if (cachedSimilarity !== null) {
                return cachedSimilarity;
            }
        }
        const a = concept1.name.toLowerCase();
        const b = concept2.name.toLowerCase();
        let similarity = 0.0;
        if (a === b) {
            similarity = 1.0;
        }
        else if (a.length === 0 || b.length === 0) {
            similarity = 0.0;
        }
        else if (a.length <= 2 || b.length <= 2) {
            const matches = Array.from(a).filter(char => b.includes(char)).length;
            const union = new Set([...a, ...b]).size;
            similarity = matches / union;
        }
        else {
            const n = 2;
            const aGrams = this.generateNGrams(a, n);
            const bGrams = this.generateNGrams(b, n);
            const intersection = new Set([...aGrams].filter(gram => bGrams.has(gram))).size;
            const union = aGrams.size + bGrams.size - intersection;
            similarity = union === 0 ? 0.0 : intersection / union;
        }
        if (this.cacheService) {
            await this.cacheService.set(cacheKey, similarity, 3600000);
        }
        return similarity;
    }
    generateNGrams(str, n) {
        const nGrams = new Set();
        for (let i = 0; i <= str.length - n; i++) {
            nGrams.add(str.substring(i, i + n));
        }
        return nGrams;
    }
    async mergeSimilarConcepts(concepts, similarityThreshold = 0.8) {
        const cacheKey = `mergedConcepts:${JSON.stringify(concepts.map(c => c.id).sort())}:${similarityThreshold}`;
        if (this.cacheService) {
            const cachedResult = await this.cacheService.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
        }
        const mergedConcepts = [];
        const processedIds = new Set();
        const nameToConceptMap = new Map();
        for (const concept of concepts) {
            const name = concept.name.toLowerCase();
            if (nameToConceptMap.has(name)) {
                const existing = nameToConceptMap.get(name);
                existing.count++;
                existing.concept.confidence = (existing.concept.confidence * (existing.count - 1) + concept.confidence) / existing.count;
                existing.concept.occurrenceCount += concept.occurrenceCount;
                existing.mergedFrom.push(concept.name);
            }
            else {
                nameToConceptMap.set(name, {
                    concept: { ...concept },
                    count: 1,
                    mergedFrom: []
                });
            }
        }
        const uniqueConcepts = Array.from(nameToConceptMap.values()).map(item => {
            if (item.mergedFrom.length > 0) {
                item.concept.metadata = {
                    ...item.concept.metadata,
                    mergedFrom: item.mergedFrom
                };
            }
            return item.concept;
        });
        for (let i = 0; i < uniqueConcepts.length; i++) {
            if (processedIds.has(uniqueConcepts[i].id))
                continue;
            let mergedConcept = { ...uniqueConcepts[i] };
            let mergedCount = 1;
            let mergedFrom = [];
            const similarityPromises = [];
            for (let j = i + 1; j < uniqueConcepts.length; j++) {
                if (processedIds.has(uniqueConcepts[j].id))
                    continue;
                const lenDiff = Math.abs(uniqueConcepts[i].name.length - uniqueConcepts[j].name.length);
                const maxLen = Math.max(uniqueConcepts[i].name.length, uniqueConcepts[j].name.length);
                if (lenDiff / maxLen > (1 - similarityThreshold)) {
                    continue;
                }
                similarityPromises.push({
                    index: j,
                    promise: this.calculateConceptSimilarity(uniqueConcepts[i], uniqueConcepts[j])
                });
            }
            const similarityResults = await Promise.all(similarityPromises.map(p => p.promise.then(similarity => ({ index: p.index, similarity }))));
            for (const result of similarityResults) {
                if (result.similarity >= similarityThreshold) {
                    const j = result.index;
                    mergedConcept.confidence = (mergedConcept.confidence * mergedCount + uniqueConcepts[j].confidence) / (mergedCount + 1);
                    mergedConcept.occurrenceCount += uniqueConcepts[j].occurrenceCount;
                    mergedFrom.push(uniqueConcepts[j].name);
                    processedIds.add(uniqueConcepts[j].id);
                    mergedCount++;
                }
            }
            if (mergedFrom.length > 0) {
                mergedConcept.metadata = {
                    ...mergedConcept.metadata,
                    mergedFrom: [
                        ...(mergedConcept.metadata.mergedFrom || []),
                        ...mergedFrom
                    ]
                };
            }
            mergedConcepts.push(new cognitive_concept_1.CognitiveConcept(mergedConcept));
            processedIds.add(uniqueConcepts[i].id);
        }
        if (this.cacheService) {
            await this.cacheService.set(cacheKey, mergedConcepts, 3600000);
        }
        return mergedConcepts;
    }
}
exports.ConceptRelationProcessor = ConceptRelationProcessor;
//# sourceMappingURL=ConceptRelationProcessor.js.map