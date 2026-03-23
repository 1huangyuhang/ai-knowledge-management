/**
 * 认知模型相关路由
 * 处理认知模型的创建、查询、更新和删除等功能
 */
import { FastifyInstance } from 'fastify';
import { CognitiveFeedbackController } from '../controllers/cognitive-feedback.controller';

/**
 * 配置认知模型路由
 * @param instance Fastify实例
 */
export async function configureCognitiveRoutes(instance: FastifyInstance): Promise<void> {
  // 创建控制器实例
  const cognitiveFeedbackController = new CognitiveFeedbackController();
  
  // 注册路由组
  instance.register((cognitiveInstance, _, done) => {
    // 健康检查路由
    cognitiveInstance.get('/health', async (_, reply) => {
      return reply.send({
        status: 'ok',
        service: 'cognitive-service'
      });
    });
    
    // 认知反馈生成路由
    cognitiveInstance.post('/:modelId/insights', cognitiveFeedbackController.generateInsights.bind(cognitiveFeedbackController));
    cognitiveInstance.post('/:modelId/themes', cognitiveFeedbackController.analyzeThemes.bind(cognitiveFeedbackController));
    cognitiveInstance.post('/:modelId/blindspots', cognitiveFeedbackController.detectBlindspots.bind(cognitiveFeedbackController));
    cognitiveInstance.post('/:modelId/gaps', cognitiveFeedbackController.identifyGaps.bind(cognitiveFeedbackController));
    cognitiveInstance.post('/:modelId/feedback', cognitiveFeedbackController.generateFeedback.bind(cognitiveFeedbackController));

    done();
  }, { prefix: '/cognitive' });
}