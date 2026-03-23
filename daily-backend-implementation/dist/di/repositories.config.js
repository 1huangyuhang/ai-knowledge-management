"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryKeys = void 0;
exports.initializeRepositories = initializeRepositories;
const container_1 = require("./container");
const database_connection_1 = require("../infrastructure/database/database-connection");
const MaintainabilityOptimizationRepositoryImpl_1 = require("../infrastructure/repositories/MaintainabilityOptimizationRepositoryImpl");
const DeploymentRepositoryImpl_1 = require("../infrastructure/repositories/DeploymentRepositoryImpl");
const MonitoringRepositoryImpl_1 = require("../infrastructure/repositories/MonitoringRepositoryImpl");
const user_repository_implementation_1 = require("../infrastructure/database/repositories/user-repository-implementation");
const cognitive_model_repository_implementation_1 = require("../infrastructure/database/repositories/cognitive-model-repository-implementation");
const thought_fragment_repository_implementation_1 = require("../infrastructure/database/repositories/thought-fragment-repository-implementation");
const cognitive_insight_repository_implementation_1 = require("../infrastructure/database/repositories/cognitive-insight-repository-implementation");
const input_analysis_repository_implementation_1 = require("../infrastructure/database/repositories/input-analysis-repository-implementation");
const PerformanceTestRepositoryImpl_1 = require("../infrastructure/database/repositories/PerformanceTestRepositoryImpl");
const PerformanceOptimizationRepositoryImpl_1 = require("../infrastructure/repositories/PerformanceOptimizationRepositoryImpl");
const SecurityOptimizationRepositoryImpl_1 = require("../infrastructure/repositories/SecurityOptimizationRepositoryImpl");
const ScalabilityOptimizationRepositoryImpl_1 = require("../infrastructure/repositories/ScalabilityOptimizationRepositoryImpl");
const AvailabilityOptimizationRepositoryImpl_1 = require("../infrastructure/repositories/AvailabilityOptimizationRepositoryImpl");
const user_entity_1 = require("../infrastructure/database/entities/user.entity");
const cognitive_model_entity_1 = require("../infrastructure/database/entities/cognitive-model.entity");
const thought_fragment_entity_1 = require("../infrastructure/database/entities/thought-fragment.entity");
const cognitive_insight_entity_1 = require("../infrastructure/database/entities/cognitive-insight.entity");
const input_analysis_entity_1 = require("../infrastructure/database/entities/input-analysis.entity");
const performance_test_entity_1 = require("../infrastructure/database/entities/performance-test.entity");
const test_result_entity_1 = require("../infrastructure/database/entities/test-result.entity");
const performance_report_entity_1 = require("../infrastructure/database/entities/performance-report.entity");
async function initializeRepositories() {
    const dataSource = await database_connection_1.databaseConnection.initialize();
    const userEntityRepository = dataSource.getRepository(user_entity_1.UserEntity);
    const cognitiveModelEntityRepository = dataSource.getRepository(cognitive_model_entity_1.CognitiveModelEntity);
    const thoughtFragmentEntityRepository = dataSource.getRepository(thought_fragment_entity_1.ThoughtFragmentEntity);
    const cognitiveInsightEntityRepository = dataSource.getRepository(cognitive_insight_entity_1.CognitiveInsightEntity);
    const inputAnalysisEntityRepository = dataSource.getRepository(input_analysis_entity_1.InputAnalysisEntity);
    const performanceTestEntityRepository = dataSource.getRepository(performance_test_entity_1.PerformanceTestEntity);
    const testScenarioEntityRepository = dataSource.getRepository(performance_test_entity_1.TestScenarioEntity);
    const testResultEntityRepository = dataSource.getRepository(test_result_entity_1.TestResultEntity);
    const performanceReportEntityRepository = dataSource.getRepository(performance_report_entity_1.PerformanceReportEntity);
    container_1.container.register('UserRepository', () => new user_repository_implementation_1.UserRepositoryImpl(userEntityRepository), true);
    container_1.container.register('CognitiveModelRepository', () => new cognitive_model_repository_implementation_1.CognitiveModelRepositoryImpl(cognitiveModelEntityRepository), true);
    container_1.container.register('ThoughtFragmentRepository', () => new thought_fragment_repository_implementation_1.ThoughtFragmentRepositoryImpl(thoughtFragmentEntityRepository), true);
    container_1.container.register('CognitiveInsightRepository', () => new cognitive_insight_repository_implementation_1.CognitiveInsightRepositoryImpl(cognitiveInsightEntityRepository), true);
    container_1.container.register('InputAnalysisRepository', () => new input_analysis_repository_implementation_1.InputAnalysisRepositoryImpl(inputAnalysisEntityRepository), true);
    container_1.container.register('PerformanceTestRepository', () => new PerformanceTestRepositoryImpl_1.PerformanceTestRepositoryImpl(dataSource), true);
    container_1.container.register('TestScenarioRepository', () => new PerformanceTestRepositoryImpl_1.TestScenarioRepositoryImpl(dataSource), true);
    container_1.container.register('TestResultRepository', () => new PerformanceTestRepositoryImpl_1.TestResultRepositoryImpl(dataSource), true);
    container_1.container.register('PerformanceReportRepository', () => new PerformanceTestRepositoryImpl_1.PerformanceReportRepositoryImpl(dataSource), true);
    container_1.container.register('PerformanceOptimizationRepository', () => {
        const logger = container_1.container.resolve('LoggerService');
        return new PerformanceOptimizationRepositoryImpl_1.PerformanceOptimizationRepositoryImpl(logger);
    }, true);
    container_1.container.register('SecurityOptimizationRepository', () => new SecurityOptimizationRepositoryImpl_1.SecurityOptimizationRepositoryImpl(), true);
    container_1.container.register('ScalabilityOptimizationRepository', () => new ScalabilityOptimizationRepositoryImpl_1.ScalabilityOptimizationRepositoryImpl(), true);
    container_1.container.register('AvailabilityOptimizationRepository', () => new AvailabilityOptimizationRepositoryImpl_1.AvailabilityOptimizationRepositoryImpl(), true);
    container_1.container.register('MaintainabilityOptimizationRepository', () => new MaintainabilityOptimizationRepositoryImpl_1.MaintainabilityOptimizationRepositoryImpl(), true);
    container_1.container.register('DeploymentRepository', () => new DeploymentRepositoryImpl_1.DeploymentRepositoryImpl(), true);
    container_1.container.register('MonitoringRepository', () => new MonitoringRepositoryImpl_1.MonitoringRepositoryImpl(), true);
    console.log('Repositories initialized and registered in DI container');
}
exports.RepositoryKeys = {
    UserRepository: 'UserRepository',
    CognitiveModelRepository: 'CognitiveModelRepository',
    ThoughtFragmentRepository: 'ThoughtFragmentRepository',
    CognitiveInsightRepository: 'CognitiveInsightRepository',
    InputAnalysisRepository: 'InputAnalysisRepository',
    PerformanceTestRepository: 'PerformanceTestRepository',
    TestScenarioRepository: 'TestScenarioRepository',
    TestResultRepository: 'TestResultRepository',
    PerformanceReportRepository: 'PerformanceReportRepository',
    PerformanceOptimizationRepository: 'PerformanceOptimizationRepository',
    SecurityOptimizationRepository: 'SecurityOptimizationRepository',
    ScalabilityOptimizationRepository: 'ScalabilityOptimizationRepository',
    AvailabilityOptimizationRepository: 'AvailabilityOptimizationRepository',
    MaintainabilityOptimizationRepository: 'MaintainabilityOptimizationRepository',
    DeploymentRepository: 'DeploymentRepository',
    MonitoringRepository: 'MonitoringRepository'
};
//# sourceMappingURL=repositories.config.js.map