"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAnalysisService = void 0;
const InputAnalysis_1 = require("../../domain/entities/InputAnalysis");
class InputAnalysisService {
    analysisRepository;
    inputRepository;
    llmClient;
    logger;
    constructor(analysisRepository, inputRepository, llmClient, logger) {
        this.analysisRepository = analysisRepository;
        this.inputRepository = inputRepository;
        this.llmClient = llmClient;
        this.logger = logger;
    }
    async initializeAnalysis(inputId, types) {
        try {
            const input = await this.inputRepository.getById(inputId);
            if (!input) {
                throw new Error(`Input with ID ${inputId.toString()} not found`);
            }
            const analyses = [];
            for (const type of types) {
                const analysis = new InputAnalysis_1.InputAnalysis({
                    inputId,
                    type,
                    result: {},
                    status: InputAnalysis_1.AnalysisStatus.PENDING,
                    confidence: 0
                });
                const savedAnalysis = await this.analysisRepository.save(analysis);
                analyses.push(savedAnalysis);
            }
            this.logger.info('Input analyses initialized successfully', { inputId: inputId.toString(), types });
            return analyses;
        }
        catch (error) {
            this.logger.error('Failed to initialize input analyses', error, { inputId: inputId.toString(), types });
            throw error;
        }
    }
    async executeAnalysis(analysisId) {
        try {
            const analysis = await this.analysisRepository.getById(analysisId);
            if (!analysis) {
                throw new Error(`Analysis with ID ${analysisId.toString()} not found`);
            }
            let updatedAnalysis = await this.analysisRepository.save(analysis.update({}, 0, InputAnalysis_1.AnalysisStatus.PROCESSING));
            const input = await this.inputRepository.getById(analysis.inputId);
            if (!input) {
                throw new Error(`Input with ID ${analysis.inputId.toString()} not found`);
            }
            let result;
            let confidence;
            switch (analysis.type) {
                case InputAnalysis_1.AnalysisType.KEYWORD_EXTRACTION:
                    result = await this.extractKeywords(input.content);
                    confidence = result.confidence || 0.9;
                    break;
                case InputAnalysis_1.AnalysisType.TOPIC_RECOGNITION:
                    result = await this.recognizeTopics(input.content);
                    confidence = result.confidence || 0.85;
                    break;
                case InputAnalysis_1.AnalysisType.SENTIMENT_ANALYSIS:
                    result = await this.analyzeSentiment(input.content);
                    confidence = result.confidence || 0.8;
                    break;
                case InputAnalysis_1.AnalysisType.CONTENT_CLASSIFICATION:
                    result = await this.classifyContent(input.content);
                    confidence = result.confidence || 0.85;
                    break;
                case InputAnalysis_1.AnalysisType.SUMMARIZATION:
                    result = await this.summarizeContent(input.content);
                    confidence = result.confidence || 0.9;
                    break;
                case InputAnalysis_1.AnalysisType.ENTITY_RECOGNITION:
                    result = await this.recognizeEntities(input.content);
                    confidence = result.confidence || 0.8;
                    break;
                case InputAnalysis_1.AnalysisType.RELATION_EXTRACTION:
                    result = await this.extractRelations(input.content);
                    confidence = result.confidence || 0.75;
                    break;
                case InputAnalysis_1.AnalysisType.READABILITY_ANALYSIS:
                    result = await this.analyzeReadability(input.content);
                    confidence = result.confidence || 0.85;
                    break;
                default:
                    throw new Error(`Unsupported analysis type: ${analysis.type}`);
            }
            updatedAnalysis = await this.analysisRepository.save(analysis.update(result, confidence, InputAnalysis_1.AnalysisStatus.COMPLETED));
            this.logger.info('Input analysis executed successfully', { analysisId: analysisId.toString(), type: analysis.type });
            return updatedAnalysis;
        }
        catch (error) {
            const analysis = await this.analysisRepository.getById(analysisId);
            if (analysis) {
                await this.analysisRepository.save(analysis.update({ error: error.message }, 0, InputAnalysis_1.AnalysisStatus.FAILED));
            }
            this.logger.error('Failed to execute input analysis', error, { analysisId: analysisId.toString() });
            throw error;
        }
    }
    async executeAllAnalysesForInput(inputId) {
        try {
            const pendingAnalyses = await this.analysisRepository.getByStatus(InputAnalysis_1.AnalysisStatus.PENDING, 100, 0);
            const inputPendingAnalyses = pendingAnalyses.filter(analysis => analysis.inputId.equals(inputId));
            const executedAnalyses = [];
            for (const analysis of inputPendingAnalyses) {
                const executedAnalysis = await this.executeAnalysis(analysis.id);
                executedAnalyses.push(executedAnalysis);
            }
            this.logger.info('All pending analyses executed for input', { inputId: inputId.toString(), executedCount: executedAnalyses.length });
            return executedAnalyses;
        }
        catch (error) {
            this.logger.error('Failed to execute all analyses for input', error, { inputId: inputId.toString() });
            throw error;
        }
    }
    async getAnalysisResults(inputId) {
        try {
            const analyses = await this.analysisRepository.getByInputId(inputId);
            const results = {};
            for (const analysis of analyses) {
                results[analysis.type] = {
                    result: analysis.result,
                    confidence: analysis.confidence,
                    status: analysis.status,
                    createdAt: analysis.createdAt,
                    updatedAt: analysis.updatedAt
                };
            }
            this.logger.info('Retrieved analysis results for input', { inputId: inputId.toString(), resultCount: Object.keys(results).length });
            return results;
        }
        catch (error) {
            this.logger.error('Failed to get analysis results', error, { inputId: inputId.toString() });
            throw error;
        }
    }
    async extractKeywords(content) {
        const prompt = `Extract the top 10 keywords from the following content. Return them as a JSON array with their relevance scores:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async recognizeTopics(content) {
        const prompt = `Identify the main topics from the following content. Return them as a JSON array with their relevance scores:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async analyzeSentiment(content) {
        const prompt = `Analyze the sentiment of the following content. Return the result as JSON with fields: sentiment (positive, neutral, negative), score, and confidence:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async classifyContent(content) {
        const prompt = `Classify the following content into one of these categories: education, entertainment, technology, business, health, science, sports, news, other. Return the result as JSON with category and confidence:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async summarizeContent(content) {
        const prompt = `Summarize the following content in 3-5 sentences. Return the result as JSON with summary and confidence:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async recognizeEntities(content) {
        const prompt = `Identify and categorize entities (people, places, organizations, dates, etc.) from the following content. Return them as a JSON array with entity text and type:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async extractRelations(content) {
        const prompt = `Extract relationships between entities in the following content. Return them as a JSON array with source entity, target entity, and relationship type:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
    async analyzeReadability(content) {
        const prompt = `Analyze the readability of the following content. Return the result as JSON with readability score (0-100), grade level, and suggestions for improvement:\n\n${content}`;
        const response = await this.llmClient.generate(prompt, { format: 'json' });
        return JSON.parse(response.content);
    }
}
exports.InputAnalysisService = InputAnalysisService;
//# sourceMappingURL=InputAnalysisService.js.map