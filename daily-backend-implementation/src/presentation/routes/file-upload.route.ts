import { FastifyInstance } from 'fastify';
import { FileUploadController } from '../controllers/FileUploadController';
import fastifyMultipart from '@fastify/multipart';

/**
 * 文件上传路由配置函数
 * @param app Fastify实例
 */
export async function configureFileUploadRoutes(app: FastifyInstance): Promise<void> {
  // 注册多部分表单支持
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1
    }
  });

  // 创建控制器实例
  const fileUploadController = new FileUploadController();

  // 注册文件上传路由
  app.post('/files/upload', {
    schema: {
      summary: '上传文件并处理',
      description: '上传文件并提取文本内容',
      tags: ['文件处理'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          description: '文件上传成功',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                fileId: { type: 'string' },
                fileName: { type: 'string' },
                fileType: { type: 'string' },
                fileSize: { type: 'number' },
                fileUrl: { type: 'string' },
                extractedText: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => fileUploadController.uploadFile(request, reply));

  // 注册获取文件信息路由
  app.get('/files/:fileId', {
    schema: {
      summary: '获取文件信息',
      description: '根据文件ID获取文件信息',
      tags: ['文件处理'],
      params: {
        type: 'object',
        properties: {
          fileId: { type: 'string' }
        },
        required: ['fileId']
      },
      response: {
        200: {
          description: '获取文件信息成功',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                fileId: { type: 'string' },
                fileName: { type: 'string' },
                fileType: { type: 'string' },
                fileSize: { type: 'number' },
                fileUrl: { type: 'string' },
                extractedText: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => fileUploadController.getFileInfo(request, reply));
}
