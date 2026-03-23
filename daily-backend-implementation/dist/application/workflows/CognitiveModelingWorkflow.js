"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelingWorkflow = void 0;
const CognitiveModelUpdateService_1 = require("../services/CognitiveModelUpdateService");
const ConceptRelationProcessor_1 = require("../services/ConceptRelationProcessor");
const ModelConsistencyChecker_1 = require("../services/ModelConsistencyChecker");
const CognitiveGraphGenerator_1 = require("../services/CognitiveGraphGenerator");
class CognitiveModelingWorkflow {
    cognitiveModelUpdateService;
    conceptRelationProcessor;
    modelConsistencyChecker;
    cognitiveGraphGenerator;
    defaultConfig = {
        updateModel: true,
        processRelations: true,
        checkConsistency: true,
        autoFixConsistency: true,
        generateGraph: true,
    };
    constructor() {
        this.cognitiveModelUpdateService = new CognitiveModelUpdateService_1.CognitiveModelUpdateService();
        this.conceptRelationProcessor = new ConceptRelationProcessor_1.ConceptRelationProcessor();
        this.modelConsistencyChecker = new ModelConsistencyChecker_1.ModelConsistencyChecker();
        this.cognitiveGraphGenerator = new CognitiveGraphGenerator_1.CognitiveGraphGenerator();
    }
    async execute(model, thoughtFragment, config = {}) {
        const startTime = Date.now();
        const workflowConfig = { ...this.defaultConfig, ...config };
        const metadata = {
            processingTime: 0,
            updateChanges: {},
            relationProcessingChanges: {},
            consistencyFixes: {},
            graphStats: {},
        };
        let updatedModel = model;
        let isConsistent = true;
        let consistencyIssues = [];
        let graph;
        if (workflowConfig.updateModel) {
            const updateResult = this.cognitiveModelUpdateService.updateCognitiveModel(updatedModel, thoughtFragment, workflowConfig.updateOptions);
            updatedModel = updateResult.model;
            metadata.updateChanges = updateResult.changes;
        }
        if (workflowConfig.processRelations) {
            const relationProcessingResult = this.conceptRelationProcessor.processConceptRelations(updatedModel.concepts, updatedModel.relations, workflowConfig.relationProcessorOptions);
            updatedModel.concepts = relationProcessingResult.concepts;
            updatedModel.relations = relationProcessingResult.relations;
            metadata.relationProcessingChanges = relationProcessingResult.metadata;
        }
        if (workflowConfig.checkConsistency) {
            const consistencyResult = this.modelConsistencyChecker.checkConsistency(updatedModel);
            isConsistent = consistencyResult.isConsistent;
            consistencyIssues = consistencyResult.issues;
            if (workflowConfig.autoFixConsistency && !isConsistent) {
                const fixResult = this.modelConsistencyChecker.autoFixConsistencyIssues(updatedModel, consistencyIssues);
                updatedModel = fixResult.model;
                consistencyIssues = fixResult.remainingIssues;
                isConsistent = consistencyIssues.length === 0;
                metadata.consistencyFixes = {
                    fixedIssues: fixResult.fixedIssues,
                    remainingIssues: fixResult.remainingIssues.length,
                };
            }
        }
        if (workflowConfig.generateGraph) {
            graph = this.cognitiveGraphGenerator.generateCognitiveGraph(updatedModel, workflowConfig.graphGeneratorOptions);
            metadata.graphStats = graph.metadata;
        }
        const endTime = Date.now();
        metadata.processingTime = endTime - startTime;
        return {
            model: updatedModel,
            isConsistent,
            consistencyIssues,
            graph,
            metadata,
        };
    }
}
exports.CognitiveModelingWorkflow = CognitiveModelingWorkflow;
//# sourceMappingURL=CognitiveModelingWorkflow.js.map