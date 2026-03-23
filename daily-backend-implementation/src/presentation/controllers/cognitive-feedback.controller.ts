/**
 * 认知反馈生成控制器
 * 处理认知反馈相关的API请求
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { InsightGenerationService } from '../../application/ai/cognitive-feedback/insight-generation-service';
import { ThemeAnalysisService } from '../../application/ai/cognitive-feedback/theme-analysis-service';
import { BlindspotDetectionService } from '../../application/ai/cognitive-feedback/blindspot-detection-service';
import { GapIdentificationService } from '../../application/ai/cognitive-feedback/gap-identification-service';
import { FeedbackFormattingService } from '../../application/ai/cognitive-feedback/feedback-formatting-service';

/**
 * 认知反馈生成控制器类
 */
export class CognitiveFeedbackController {
  private insightGenerationService: InsightGenerationService;
  private themeAnalysisService: ThemeAnalysisService;
  private blindspotDetectionService: BlindspotDetectionService;
  private gapIdentificationService: GapIdentificationService;
  private feedbackFormattingService: FeedbackFormattingService;

  /**
   * 构造函数，通过依赖注入获取服务实例
   */
  constructor() {
    this.insightGenerationService = container.resolve('InsightGenerationService');
    this.themeAnalysisService = container.resolve('ThemeAnalysisService');
    this.blindspotDetectionService = container.resolve('BlindspotDetectionService');
    this.gapIdentificationService = container.resolve('GapIdentificationService');
    this.feedbackFormattingService = container.resolve('FeedbackFormattingService');
  }

  /**
   * 生成认知洞察
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async generateInsights(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { options } = request.body as any;
      const modelId = (request.params as any)?.modelId;
      const userId = 'anonymous'; // 简化处理，实际应该从认证中间件获取

      const insights = await this.insightGenerationService.generateInsights(userId, modelId, options);
      return reply.send({ success: true, data: insights });
    } catch (error) {
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to generate insights' });
    }
  }

  /**
   * 执行主题分析
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async analyzeThemes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { options } = request.body as any;
      const modelId = (request.params as any)?.modelId;
      const userId = 'anonymous';

      const themes = await this.themeAnalysisService.analyzeThemes(userId, modelId, options);
      return reply.send({ success: true, data: themes });
    } catch (error) {
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to analyze themes' });
    }
  }

  /**
   * 检测盲点
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async detectBlindspots(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { options } = request.body as any;
      const modelId = (request.params as any)?.modelId;
      const userId = 'anonymous';

      const blindspots = await this.blindspotDetectionService.detectBlindspots(userId, modelId, options);
      return reply.send({ success: true, data: blindspots });
    } catch (error) {
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to detect blindspots' });
    }
  }

  /**
   * 识别差距
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async identifyGaps(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { options } = request.body as any;
      const modelId = (request.params as any)?.modelId;
      const userId = 'anonymous';

      const gaps = await this.gapIdentificationService.identifyGaps(userId, modelId, options);
      return reply.send({ success: true, data: gaps });
    } catch (error) {
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to identify gaps' });
    }
  }

  /**
   * 生成完整反馈
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async generateFeedback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { options } = request.body as any;
      const modelId = (request.params as any)?.modelId;
      const userId = 'anonymous';

      // 生成洞察
      const insights = await this.insightGenerationService.generateInsights(userId, modelId, options);
      // 执行主题分析
      const themes = await this.themeAnalysisService.analyzeThemes(userId, modelId, options);
      // 检测盲点
      const blindspots = await this.blindspotDetectionService.detectBlindspots(userId, modelId, options);
      // 识别差距
      const gaps = await this.gapIdentificationService.identifyGaps(userId, modelId, options);

      // 格式化反馈 - 简化处理，直接返回原始数据
      return reply.send({ 
        success: true, 
        data: {
          insights,
          themes,
          blindspots,
          gaps
        } 
      });
    } catch (error) {
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to generate feedback' });
    }
  }
}
