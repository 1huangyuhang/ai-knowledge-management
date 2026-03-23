import { UUID } from '../../domain/value-objects/UUID';
import { InputAnalysis, AnalysisStatus, AnalysisType } from '../../domain/entities/InputAnalysis';
import { InputAnalysisRepository } from '../../domain/repositories/InputAnalysisRepository';
import { InputRepository } from '../../domain/repositories/InputRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { LLMClient } from '../../ai/llm/LLMClient';

/**
 * 输入分析服务
 * 负责处理输入分析的业务逻辑
 */
export class InputAnalysisService {
  constructor(
    private readonly analysisRepository: InputAnalysisRepository,
    private readonly inputRepository: InputRepository,
    private readonly llmClient: LLMClient,
    private readonly logger: LoggerService
  ) {}

  /**
   * 初始化输入分析
   * @param inputId 输入ID
   * @param types 分析类型列表
   * @returns 初始化的分析实体列表
   */
  async initializeAnalysis(inputId: UUID, types: AnalysisType[]): Promise<InputAnalysis[]> {
    try {
      // 检查输入是否存在
      const input = await this.inputRepository.getById(inputId);
      if (!input) {
        throw new Error(`Input with ID ${inputId.toString()} not found`);
      }

      // 初始化分析实体
      const analyses: InputAnalysis[] = [];
      for (const type of types) {
        const analysis = new InputAnalysis({
          inputId,
          type,
          result: {},
          status: AnalysisStatus.PENDING,
          confidence: 0
        });
        const savedAnalysis = await this.analysisRepository.save(analysis);
        analyses.push(savedAnalysis);
      }

      this.logger.info('Input analyses initialized successfully', { inputId: inputId.toString(), types });
      return analyses;
    } catch (error) {
      this.logger.error('Failed to initialize input analyses', error as Error, { inputId: inputId.toString(), types });
      throw error;
    }
  }

  /**
   * 执行输入分析
   * @param analysisId 分析ID
   * @returns 更新后的分析实体
   */
  async executeAnalysis(analysisId: UUID): Promise<InputAnalysis> {
    try {
      // 获取分析实体
      const analysis = await this.analysisRepository.getById(analysisId);
      if (!analysis) {
        throw new Error(`Analysis with ID ${analysisId.toString()} not found`);
      }

      // 更新状态为处理中
      let updatedAnalysis = await this.analysisRepository.save(
        analysis.update({}, 0, AnalysisStatus.PROCESSING)
      );

      // 获取输入内容
      const input = await this.inputRepository.getById(analysis.inputId);
      if (!input) {
        throw new Error(`Input with ID ${analysis.inputId.toString()} not found`);
      }

      // 执行分析
      let result: Record<string, any>;
      let confidence: number;

      switch (analysis.type) {
        case AnalysisType.KEYWORD_EXTRACTION:
          result = await this.extractKeywords(input.content);
          confidence = result.confidence || 0.9;
          break;
        case AnalysisType.TOPIC_RECOGNITION:
          result = await this.recognizeTopics(input.content);
          confidence = result.confidence || 0.85;
          break;
        case AnalysisType.SENTIMENT_ANALYSIS:
          result = await this.analyzeSentiment(input.content);
          confidence = result.confidence || 0.8;
          break;
        case AnalysisType.CONTENT_CLASSIFICATION:
          result = await this.classifyContent(input.content);
          confidence = result.confidence || 0.85;
          break;
        case AnalysisType.SUMMARIZATION:
          result = await this.summarizeContent(input.content);
          confidence = result.confidence || 0.9;
          break;
        case AnalysisType.ENTITY_RECOGNITION:
          result = await this.recognizeEntities(input.content);
          confidence = result.confidence || 0.8;
          break;
        case AnalysisType.RELATION_EXTRACTION:
          result = await this.extractRelations(input.content);
          confidence = result.confidence || 0.75;
          break;
        case AnalysisType.READABILITY_ANALYSIS:
          result = await this.analyzeReadability(input.content);
          confidence = result.confidence || 0.85;
          break;
        default:
          throw new Error(`Unsupported analysis type: ${analysis.type}`);
      }

      // 更新分析结果
      updatedAnalysis = await this.analysisRepository.save(
        analysis.update(result, confidence, AnalysisStatus.COMPLETED)
      );

      this.logger.info('Input analysis executed successfully', { analysisId: analysisId.toString(), type: analysis.type });
      return updatedAnalysis;
    } catch (error) {
      // 更新状态为失败
      const analysis = await this.analysisRepository.getById(analysisId);
      if (analysis) {
        await this.analysisRepository.save(
          analysis.update({ error: (error as Error).message }, 0, AnalysisStatus.FAILED)
        );
      }

      this.logger.error('Failed to execute input analysis', error as Error, { analysisId: analysisId.toString() });
      throw error;
    }
  }

  /**
   * 批量执行输入分析
   * @param inputId 输入ID
   * @returns 执行的分析实体列表
   */
  async executeAllAnalysesForInput(inputId: UUID): Promise<InputAnalysis[]> {
    try {
      // 获取输入的所有待处理分析
      const pendingAnalyses = await this.analysisRepository.getByStatus(AnalysisStatus.PENDING, 100, 0);
      const inputPendingAnalyses = pendingAnalyses.filter(analysis => analysis.inputId.equals(inputId));

      // 执行所有待处理分析
      const executedAnalyses: InputAnalysis[] = [];
      for (const analysis of inputPendingAnalyses) {
        const executedAnalysis = await this.executeAnalysis(analysis.id);
        executedAnalyses.push(executedAnalysis);
      }

      this.logger.info('All pending analyses executed for input', { inputId: inputId.toString(), executedCount: executedAnalyses.length });
      return executedAnalyses;
    } catch (error) {
      this.logger.error('Failed to execute all analyses for input', error as Error, { inputId: inputId.toString() });
      throw error;
    }
  }

  /**
   * 获取输入的分析结果
   * @param inputId 输入ID
   * @returns 分析结果列表
   */
  async getAnalysisResults(inputId: UUID): Promise<Record<string, any>> {
    try {
      const analyses = await this.analysisRepository.getByInputId(inputId);
      const results: Record<string, any> = {};

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
    } catch (error) {
      this.logger.error('Failed to get analysis results', error as Error, { inputId: inputId.toString() });
      throw error;
    }
  }

  /**
   * 关键词提取
   * @param content 输入内容
   * @returns 关键词提取结果
   */
  private async extractKeywords(content: string): Promise<Record<string, any>> {
    // 使用LLM提取关键词
    const prompt = `Extract the top 10 keywords from the following content. Return them as a JSON array with their relevance scores:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 主题识别
   * @param content 输入内容
   * @returns 主题识别结果
   */
  private async recognizeTopics(content: string): Promise<Record<string, any>> {
    // 使用LLM识别主题
    const prompt = `Identify the main topics from the following content. Return them as a JSON array with their relevance scores:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 情感分析
   * @param content 输入内容
   * @returns 情感分析结果
   */
  private async analyzeSentiment(content: string): Promise<Record<string, any>> {
    // 使用LLM进行情感分析
    const prompt = `Analyze the sentiment of the following content. Return the result as JSON with fields: sentiment (positive, neutral, negative), score, and confidence:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 内容分类
   * @param content 输入内容
   * @returns 内容分类结果
   */
  private async classifyContent(content: string): Promise<Record<string, any>> {
    // 使用LLM进行内容分类
    const prompt = `Classify the following content into one of these categories: education, entertainment, technology, business, health, science, sports, news, other. Return the result as JSON with category and confidence:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 内容摘要
   * @param content 输入内容
   * @returns 内容摘要结果
   */
  private async summarizeContent(content: string): Promise<Record<string, any>> {
    // 使用LLM生成摘要
    const prompt = `Summarize the following content in 3-5 sentences. Return the result as JSON with summary and confidence:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 实体识别
   * @param content 输入内容
   * @returns 实体识别结果
   */
  private async recognizeEntities(content: string): Promise<Record<string, any>> {
    // 使用LLM识别实体
    const prompt = `Identify and categorize entities (people, places, organizations, dates, etc.) from the following content. Return them as a JSON array with entity text and type:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 关系提取
   * @param content 输入内容
   * @returns 关系提取结果
   */
  private async extractRelations(content: string): Promise<Record<string, any>> {
    // 使用LLM提取关系
    const prompt = `Extract relationships between entities in the following content. Return them as a JSON array with source entity, target entity, and relationship type:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }

  /**
   * 可读性分析
   * @param content 输入内容
   * @returns 可读性分析结果
   */
  private async analyzeReadability(content: string): Promise<Record<string, any>> {
    // 使用LLM进行可读性分析
    const prompt = `Analyze the readability of the following content. Return the result as JSON with readability score (0-100), grade level, and suggestions for improvement:\n\n${content}`;
    const response = await this.llmClient.generate(prompt, { format: 'json' });
    return JSON.parse(response.content);
  }
}
