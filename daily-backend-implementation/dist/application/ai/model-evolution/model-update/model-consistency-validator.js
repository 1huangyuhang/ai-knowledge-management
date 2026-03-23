"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConsistencyValidatorImpl = void 0;
class ModelConsistencyValidatorImpl {
    async validate(model) {
        const errors = [];
        const warnings = [];
        this.validateBasicStructure(model, errors, warnings);
        this.validateConcepts(model, errors, warnings);
        this.validateRelations(model, errors, warnings);
        this.validateConceptHierarchy(model, errors, warnings);
        this.validateRelationWeights(model, errors, warnings);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    validateBasicStructure(model, errors, warnings) {
        if (!model) {
            errors.push('Model is null or undefined');
            return;
        }
        if (!model.id) {
            errors.push('Model missing required field: id');
        }
        if (!model.userId) {
            errors.push('Model missing required field: userId');
        }
        if (!Array.isArray(model.concepts)) {
            errors.push('Model.concepts must be an array');
            model.concepts = [];
        }
        if (!Array.isArray(model.relations)) {
            errors.push('Model.relations must be an array');
            model.relations = [];
        }
        if (!model.createdAt) {
            warnings.push('Model missing optional field: createdAt');
        }
        if (!model.updatedAt) {
            warnings.push('Model missing optional field: updatedAt');
        }
    }
    validateConcepts(model, errors, warnings) {
        if (!model.concepts || model.concepts.length === 0) {
            warnings.push('Model has no concepts');
            return;
        }
        const conceptIds = new Set();
        const conceptNames = new Set();
        for (const concept of model.concepts) {
            if (!concept.id) {
                errors.push('Concept missing required field: id');
                continue;
            }
            if (!concept.name) {
                errors.push(`Concept ${concept.id} missing required field: name`);
            }
            if (conceptIds.has(concept.id)) {
                errors.push(`Duplicate concept ID found: ${concept.id}`);
            }
            else {
                conceptIds.add(concept.id);
            }
            if (concept.name && conceptNames.has(concept.name)) {
                warnings.push(`Duplicate concept name found: ${concept.name}`);
            }
            else if (concept.name) {
                conceptNames.add(concept.name);
            }
            if (concept.weight !== undefined && (typeof concept.weight !== 'number' || isNaN(concept.weight))) {
                errors.push(`Concept ${concept.id} has invalid weight: ${concept.weight}`);
            }
            if (concept.confidence !== undefined && (typeof concept.confidence !== 'number' || isNaN(concept.confidence))) {
                errors.push(`Concept ${concept.id} has invalid confidence: ${concept.confidence}`);
            }
        }
    }
    validateRelations(model, errors, warnings) {
        if (!model.relations || model.relations.length === 0) {
            warnings.push('Model has no relations');
            return;
        }
        const conceptIds = new Set(model.concepts.map((c) => c.id));
        const relationIds = new Set();
        for (const relation of model.relations) {
            if (!relation.id) {
                errors.push('Relation missing required field: id');
                continue;
            }
            if (!relation.fromConceptId) {
                errors.push(`Relation ${relation.id} missing required field: fromConceptId`);
            }
            if (!relation.toConceptId) {
                errors.push(`Relation ${relation.id} missing required field: toConceptId`);
            }
            if (relationIds.has(relation.id)) {
                errors.push(`Duplicate relation ID found: ${relation.id}`);
            }
            else {
                relationIds.add(relation.id);
            }
            if (relation.fromConceptId && !conceptIds.has(relation.fromConceptId)) {
                errors.push(`Relation ${relation.id} references non-existent concept: ${relation.fromConceptId}`);
            }
            if (relation.toConceptId && !conceptIds.has(relation.toConceptId)) {
                errors.push(`Relation ${relation.id} references non-existent concept: ${relation.toConceptId}`);
            }
            if (!relation.type) {
                warnings.push(`Relation ${relation.id} missing optional field: type`);
            }
            if (relation.weight !== undefined && (typeof relation.weight !== 'number' || isNaN(relation.weight))) {
                errors.push(`Relation ${relation.id} has invalid weight: ${relation.weight}`);
            }
            if (relation.confidence !== undefined && (typeof relation.confidence !== 'number' || isNaN(relation.confidence))) {
                errors.push(`Relation ${relation.id} has invalid confidence: ${relation.confidence}`);
            }
        }
    }
    validateConceptHierarchy(model, errors, warnings) {
        if (!model.concepts || model.concepts.length === 0) {
            return;
        }
        const conceptIds = new Set(model.concepts.map((c) => c.id));
        const parentChildMap = new Map();
        for (const concept of model.concepts) {
            if (concept.parentId) {
                if (!conceptIds.has(concept.parentId)) {
                    errors.push(`Concept ${concept.id} has invalid parentId: ${concept.parentId}`);
                }
                else {
                    if (!parentChildMap.has(concept.parentId)) {
                        parentChildMap.set(concept.parentId, []);
                    }
                    parentChildMap.get(concept.parentId)?.push(concept.id);
                }
            }
        }
        this.detectCircularDependencies(model.concepts, parentChildMap, errors);
        this.detectDeepHierarchy(model.concepts, parentChildMap, warnings);
    }
    detectCircularDependencies(concepts, parentChildMap, errors) {
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const detectCycle = (conceptId) => {
            if (recursionStack.has(conceptId)) {
                const cycleStartIndex = path.indexOf(conceptId);
                if (cycleStartIndex !== -1) {
                    const cycle = [...path.slice(cycleStartIndex), conceptId].join(' -> ');
                    errors.push(`Circular dependency detected: ${cycle}`);
                }
                return;
            }
            if (visited.has(conceptId)) {
                return;
            }
            visited.add(conceptId);
            recursionStack.add(conceptId);
            path.push(conceptId);
            const children = parentChildMap.get(conceptId) || [];
            for (const childId of children) {
                detectCycle(childId);
            }
            recursionStack.delete(conceptId);
            path.pop();
        };
        for (const concept of concepts) {
            if (!visited.has(concept.id)) {
                detectCycle(concept.id);
            }
        }
    }
    detectDeepHierarchy(concepts, parentChildMap, warnings) {
        const maxDepth = 10;
        const depthMap = new Map();
        const calculateDepth = (conceptId) => {
            if (depthMap.has(conceptId)) {
                return depthMap.get(conceptId);
            }
            const concept = concepts.find((c) => c.id === conceptId);
            if (!concept || !concept.parentId) {
                depthMap.set(conceptId, 0);
                return 0;
            }
            const parentDepth = calculateDepth(concept.parentId);
            const depth = parentDepth + 1;
            depthMap.set(conceptId, depth);
            if (depth > maxDepth) {
                warnings.push(`Concept ${conceptId} has excessive depth: ${depth} (max allowed: ${maxDepth})`);
            }
            return depth;
        };
        for (const concept of concepts) {
            calculateDepth(concept.id);
        }
    }
    validateRelationWeights(model, errors, warnings) {
        if (!model.relations || model.relations.length === 0) {
            return;
        }
        for (const relation of model.relations) {
            if (relation.weight !== undefined) {
                if (relation.weight < 0 || relation.weight > 1) {
                    warnings.push(`Relation ${relation.id} has weight outside recommended range [0, 1]: ${relation.weight}`);
                }
            }
            if (relation.confidence !== undefined) {
                if (relation.confidence < 0 || relation.confidence > 1) {
                    warnings.push(`Relation ${relation.id} has confidence outside recommended range [0, 1]: ${relation.confidence}`);
                }
            }
        }
    }
}
exports.ModelConsistencyValidatorImpl = ModelConsistencyValidatorImpl;
//# sourceMappingURL=model-consistency-validator.js.map