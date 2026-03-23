"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureDependencyInjection = void 0;
const database_connection_1 = require("../database/database-connection");
const event_bus_1 = require("../events/event-bus");
const thought_fragment_repository_implementation_1 = require("../database/repositories/thought-fragment-repository-implementation");
const cognitive_model_repository_implementation_1 = require("../database/repositories/cognitive-model-repository-implementation");
const create_thought_use_case_1 = require("../../application/use-cases/thought/create-thought.use-case");
const generate_proposal_use_case_1 = require("../../application/use-cases/ai/generate-proposal.use-case");
const update_model_use_case_1 = require("../../application/use-cases/cognitive/update-model.use-case");
const ModelSummaryGenerator_1 = require("../../application/services/ModelSummaryGenerator");
const CognitiveStructureVisualizationService_1 = require("../../application/services/CognitiveStructureVisualizationService");
const OutputFormattingService_1 = require("../../application/services/OutputFormattingService");
const ModelExportService_1 = require("../../application/services/ModelExportService");
const CognitiveModelUpdateService_1 = require("../../application/services/CognitiveModelUpdateService");
const ConceptRelationProcessor_1 = require("../../application/services/ConceptRelationProcessor");
const ModelConsistencyChecker_1 = require("../../application/services/ModelConsistencyChecker");
const CognitiveGraphGenerator_1 = require("../../application/services/CognitiveGraphGenerator");
const DependencyConfig_1 = require("./ai/DependencyConfig");
const DependencyContainer_1 = require("./DependencyContainer");
const configureDependencyInjection = (configManager, loggingSystem) => {
    DependencyContainer_1.globalContainer.registerSingleton('ConfigManager', () => configManager);
    DependencyContainer_1.globalContainer.registerSingleton('LoggerService', () => loggingSystem);
    DependencyContainer_1.globalContainer.registerSingleton('DatabaseClient', () => {
        const databaseUrl = configManager.get('DATABASE_URL', ':memory:');
        return new database_connection_1.DatabaseClient(databaseUrl);
    });
    DependencyContainer_1.globalContainer.registerSingleton('EventSystem', () => {
        return new event_bus_1.EventSystem();
    });
    DependencyContainer_1.globalContainer.registerSingleton('ErrorHandler', () => {
        return new error_handler_1.ErrorHandler(loggingSystem);
    });
    DependencyContainer_1.globalContainer.registerSingleton('ThoughtRepository', () => {
        const databaseClient = DependencyContainer_1.globalContainer.resolve('DatabaseClient');
        const eventSystem = DependencyContainer_1.globalContainer.resolve('EventSystem');
        return new thought_fragment_repository_implementation_1.ThoughtRepositoryImpl(databaseClient, eventSystem);
    });
    DependencyContainer_1.globalContainer.registerSingleton('CognitiveModelRepository', () => {
        const databaseClient = DependencyContainer_1.globalContainer.resolve('DatabaseClient');
        const eventSystem = DependencyContainer_1.globalContainer.resolve('EventSystem');
        return new cognitive_model_repository_implementation_1.CognitiveModelRepositoryImpl(databaseClient, eventSystem);
    });
    DependencyContainer_1.globalContainer.registerSingleton('IngestThoughtUseCase', () => {
        const thoughtRepository = DependencyContainer_1.globalContainer.resolve('ThoughtRepository');
        return new create_thought_use_case_1.IngestThoughtUseCase(thoughtRepository);
    });
    DependencyContainer_1.globalContainer.registerSingleton('GenerateProposalUseCase', () => {
        const thoughtRepository = DependencyContainer_1.globalContainer.resolve('ThoughtRepository');
        return new generate_proposal_use_case_1.GenerateProposalUseCase(thoughtRepository);
    });
    DependencyContainer_1.globalContainer.registerSingleton('UpdateCognitiveModelUseCase', () => {
        const cognitiveModelRepository = DependencyContainer_1.globalContainer.resolve('CognitiveModelRepository');
        return new update_model_use_case_1.UpdateCognitiveModelUseCase(cognitiveModelRepository);
    });
    DependencyContainer_1.globalContainer.registerSingleton('ModelSummaryGenerator', () => {
        return new ModelSummaryGenerator_1.ModelSummaryGenerator();
    });
    DependencyContainer_1.globalContainer.registerSingleton('CognitiveStructureVisualizationService', () => {
        return new CognitiveStructureVisualizationService_1.CognitiveStructureVisualizationService();
    });
    DependencyContainer_1.globalContainer.registerSingleton('OutputFormattingService', () => {
        return new OutputFormattingService_1.OutputFormattingService();
    });
    DependencyContainer_1.globalContainer.registerSingleton('ModelExportService', () => {
        return new ModelExportService_1.ModelExportService();
    });
    DependencyContainer_1.globalContainer.registerSingleton('CognitiveModelUpdateService', () => {
        return new CognitiveModelUpdateService_1.CognitiveModelUpdateService();
    });
    DependencyContainer_1.globalContainer.registerSingleton('ConceptRelationProcessor', () => {
        return new ConceptRelationProcessor_1.ConceptRelationProcessor();
    });
    DependencyContainer_1.globalContainer.registerSingleton('ModelConsistencyChecker', () => {
        return new ModelConsistencyChecker_1.ModelConsistencyChecker();
    });
    DependencyContainer_1.globalContainer.registerSingleton('CognitiveGraphGenerator', () => {
        return new CognitiveGraphGenerator_1.CognitiveGraphGenerator();
    });
    DependencyConfig_1.AiDependencyConfig.configure(DependencyContainer_1.globalContainer);
};
exports.configureDependencyInjection = configureDependencyInjection;
//# sourceMappingURL=DependencyConfig.js.map