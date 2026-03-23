"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionHistoryImpl = exports.CognitiveInsightImpl = exports.CognitiveProposalImpl = exports.ThoughtFragmentImpl = exports.CognitiveRelationImpl = exports.CognitiveConceptImpl = exports.UserCognitiveModelImpl = void 0;
class UserCognitiveModelImpl {
    id;
    userId;
    concepts;
    relations;
    evolutionHistory;
    createdAt;
    updatedAt;
    constructor(id, userId) {
        this.id = id;
        this.userId = userId;
        this.concepts = [];
        this.relations = [];
        this.evolutionHistory = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    addConcept(concept) {
        const existingConcept = this.concepts.find(c => c.id === concept.id);
        if (existingConcept) {
            throw new Error(`Concept with id ${concept.id} already exists`);
        }
        this.concepts.push(concept);
        this.updatedAt = new Date();
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'ADD_CONCEPT',
            changeContent: { concept },
            changedAt: new Date(),
            trigger: 'USER_ACTION'
        });
    }
    removeConcept(conceptId) {
        const conceptIndex = this.concepts.findIndex(c => c.id === conceptId);
        if (conceptIndex === -1) {
            throw new Error(`Concept with id ${conceptId} not found`);
        }
        this.relations = this.relations.filter(r => r.sourceConceptId !== conceptId && r.targetConceptId !== conceptId);
        const removedConcept = this.concepts.splice(conceptIndex, 1)[0];
        this.updatedAt = new Date();
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'REMOVE_CONCEPT',
            changeContent: { conceptId, removedConcept },
            changedAt: new Date(),
            trigger: 'USER_ACTION'
        });
    }
    updateConcept(concept) {
        const conceptIndex = this.concepts.findIndex(c => c.id === concept.id);
        if (conceptIndex === -1) {
            throw new Error(`Concept with id ${concept.id} not found`);
        }
        const oldConcept = this.concepts[conceptIndex];
        this.concepts[conceptIndex] = concept;
        this.updatedAt = new Date();
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'UPDATE_CONCEPT',
            changeContent: { oldConcept, newConcept: concept },
            changedAt: new Date(),
            trigger: 'USER_ACTION'
        });
    }
    addRelation(relation) {
        const existingRelation = this.relations.find(r => r.id === relation.id);
        if (existingRelation) {
            throw new Error(`Relation with id ${relation.id} already exists`);
        }
        const sourceConceptExists = this.concepts.some(c => c.id === relation.sourceConceptId);
        const targetConceptExists = this.concepts.some(c => c.id === relation.targetConceptId);
        if (!sourceConceptExists) {
            throw new Error(`Source concept with id ${relation.sourceConceptId} not found`);
        }
        if (!targetConceptExists) {
            throw new Error(`Target concept with id ${relation.targetConceptId} not found`);
        }
        this.relations.push(relation);
        this.updatedAt = new Date();
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'ADD_RELATION',
            changeContent: { relation },
            changedAt: new Date(),
            trigger: 'USER_ACTION'
        });
    }
    removeRelation(relationId) {
        const relationIndex = this.relations.findIndex(r => r.id === relationId);
        if (relationIndex === -1) {
            throw new Error(`Relation with id ${relationId} not found`);
        }
        const removedRelation = this.relations.splice(relationIndex, 1)[0];
        this.updatedAt = new Date();
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'REMOVE_RELATION',
            changeContent: { relationId, removedRelation },
            changedAt: new Date(),
            trigger: 'USER_ACTION'
        });
    }
    applyProposal(proposal) {
        proposal.concepts.forEach(concept => {
            try {
                this.addConcept(concept);
            }
            catch (error) {
                if (error.message.includes('already exists')) {
                    this.updateConcept(concept);
                }
                else {
                    throw error;
                }
            }
        });
        proposal.relations.forEach(relation => {
            try {
                this.addRelation(relation);
            }
            catch (error) {
                if (error.message.includes('already exists')) {
                    console.warn(`Relation ${relation.id} already exists, skipping`);
                }
                else {
                    throw error;
                }
            }
        });
        this.evolutionHistory.push({
            id: `${this.id}-${Date.now()}`,
            changeType: 'APPLY_PROPOSAL',
            changeContent: { proposalId: proposal.id, conceptsCount: proposal.concepts.length, relationsCount: proposal.relations.length },
            changedAt: new Date(),
            trigger: 'AI_PROPOSAL'
        });
    }
}
exports.UserCognitiveModelImpl = UserCognitiveModelImpl;
class CognitiveConceptImpl {
    id;
    semanticIdentity;
    abstractionLevel;
    confidenceScore;
    description;
    metadata;
    constructor(id, semanticIdentity, abstractionLevel, confidenceScore, description, metadata) {
        this.id = id;
        this.semanticIdentity = semanticIdentity;
        this.abstractionLevel = abstractionLevel;
        this.confidenceScore = confidenceScore;
        this.description = description;
        this.metadata = metadata;
    }
}
exports.CognitiveConceptImpl = CognitiveConceptImpl;
class CognitiveRelationImpl {
    id;
    sourceConceptId;
    targetConceptId;
    relationType;
    strength;
    confidence;
    description;
    constructor(id, sourceConceptId, targetConceptId, relationType, strength, confidence, description) {
        this.id = id;
        this.sourceConceptId = sourceConceptId;
        this.targetConceptId = targetConceptId;
        this.relationType = relationType;
        this.strength = strength;
        this.confidence = confidence;
        this.description = description;
    }
}
exports.CognitiveRelationImpl = CognitiveRelationImpl;
class ThoughtFragmentImpl {
    id;
    content;
    metadata;
    userId;
    createdAt;
    updatedAt;
    constructor(id, content, metadata, userId, createdAt, updatedAt) {
        this.id = id;
        this.content = content;
        this.metadata = metadata;
        this.userId = userId;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}
exports.ThoughtFragmentImpl = ThoughtFragmentImpl;
class CognitiveProposalImpl {
    id;
    thoughtId;
    concepts;
    relations;
    confidence;
    reasoningTrace;
    createdAt;
    userId;
    constructor(id, thoughtId, concepts, relations, confidence, reasoningTrace, userId, createdAt) {
        this.id = id;
        this.thoughtId = thoughtId;
        this.concepts = concepts;
        this.relations = relations;
        this.confidence = confidence;
        this.reasoningTrace = reasoningTrace;
        this.createdAt = createdAt || new Date();
        this.userId = userId;
    }
}
exports.CognitiveProposalImpl = CognitiveProposalImpl;
class CognitiveInsightImpl {
    id;
    modelId;
    coreThemes;
    blindSpots;
    conceptGaps;
    structureSummary;
    createdAt;
    confidence;
    constructor(id, modelId, coreThemes, blindSpots, conceptGaps, structureSummary, confidence, createdAt) {
        this.id = id;
        this.modelId = modelId;
        this.coreThemes = coreThemes;
        this.blindSpots = blindSpots;
        this.conceptGaps = conceptGaps;
        this.structureSummary = structureSummary;
        this.createdAt = createdAt || new Date();
        this.confidence = confidence;
    }
}
exports.CognitiveInsightImpl = CognitiveInsightImpl;
class EvolutionHistoryImpl {
    id;
    changeType;
    changeContent;
    changedAt;
    trigger;
    constructor(id, changeType, changeContent, changedAt, trigger) {
        this.id = id;
        this.changeType = changeType;
        this.changeContent = changeContent;
        this.changedAt = changedAt;
        this.trigger = trigger;
    }
}
exports.EvolutionHistoryImpl = EvolutionHistoryImpl;
//# sourceMappingURL=user-cognitive-model.impl.js.map