import { FastifyInstance } from 'fastify';
import { SpeechToTextController } from '../controllers/SpeechToTextController';
import fastifyMultipart from '@fastify/multipart';

/**
 * 语音转文本路由配置函数
 * @param app Fastify实例
 */
export async function configureSpeechToTextRoutes(app: FastifyInstance): Promise<void> {
  // 注册多部分表单支持
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1
    }
  });

  // 创建控制器实例
  const speechToTextController = new SpeechToTextController();

  // 注册语音转文本路由
  app.post('/speech-to-text', {
    schema: {
      summary: '上传语音文件并转换为文本',
      description: '上传语音文件并使用AI转换为文本',
      tags: ['语音处理'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          description: '语音转文本成功',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                speechId: { type: 'string' },
                audioUrl: { type: 'string' },
                transcription: { type: 'string' },
                confidence: { type: 'number' },
                language: { type: 'string' },
                duration: { type: 'number' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => speechToTextController.speechToText(request, reply));

  // 注册获取语音转文本结果路由
  app.get('/speech-to-text/:speechId', { 
    schema: {
      summary: '获取语音转文本结果',
      description: '根据语音ID获取语音转文本结果',
      tags: ['语音处理'],
      params: {
        type: 'object',
        properties: {
          speechId: { type: 'string' }
        },
        required: ['speechId']
      },
      response: {
        200: {
          description: '获取语音转文本结果成功',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                speechId: { type: 'string' },
                audioUrl: { type: 'string' },
                transcription: { type: 'string' },
                confidence: { type: 'number' },
                language: { type: 'string' },
                duration: { type: 'number' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => speechToTextController.getSpeechToTextResult(request, reply));
}
