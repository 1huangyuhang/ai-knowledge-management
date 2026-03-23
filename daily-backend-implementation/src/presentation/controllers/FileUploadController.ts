import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { FileProcessorService } from '../../application/services/FileProcessorService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { FileInput } from '../../domain/entities/file-input';

/**
 * 文件上传控制器类
 * 处理文件上传相关的API请求
 */
export class FileUploadController {
  private fileProcessorService: FileProcessorService;
  private fileStorageService: FileStorageService;

  /**
   * 构造函数，通过依赖注入获取服务实例
   */
  constructor() {
    this.fileProcessorService = container.resolve('FileProcessorService');
    this.fileStorageService = container.resolve('FileStorageService');
  }

  /**
   * 上传文件并处理
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 解析多部分表单数据
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ success: false, message: 'No file uploaded' });
      }
      
      // 读取文件内容
      const fileContent = await data.toBuffer();
      
      // 从文件名获取文件类型
      const fileName = data.filename || 'unknown';
      const fileType = fileName.split('.').pop() || 'unknown';
      
      // 创建文件输入实体
      const fileInput = new FileInput({
        name: fileName,
        type: fileType,
        size: fileContent.length,
        content: fileContent,
        metadata: {
          originalName: fileName,
          mimeType: data.mimetype || 'application/octet-stream',
          uploadedAt: new Date().toISOString()
        },
        userId: 'anonymous' // 简化处理，实际应该从认证中间件获取
      });
      
      // 处理文件，提取文本内容
      const { text, processedFile } = await this.fileProcessorService.processFile(fileInput);
      
      // 保存文件到存储服务
      const fileUrl = await this.fileStorageService.saveFile(processedFile);
      
      // 更新文件输入实体的URL
      processedFile.updateMetadata({ fileUrl });
      
      return reply.send({
        success: true,
        data: {
          fileId: processedFile.id,
          fileName: processedFile.name,
          fileType: processedFile.type,
          fileSize: processedFile.size,
          fileUrl,
          extractedText: text,
          metadata: processedFile.metadata
        }
      });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to upload file' 
      });
    }
  }

  /**
   * 获取文件信息
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async getFileInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { fileId } = request.params as { fileId: string };
      
      // TODO: 实现获取文件信息的逻辑
      // 这里需要从数据库或文件系统中获取文件信息
      
      return reply.send({
        success: true,
        data: {
          fileId,
          // 这里返回模拟数据，实际应该从存储中获取
          fileName: `file-${fileId}`,
          fileType: 'txt',
          fileSize: 1024,
          fileUrl: `http://localhost:3000/api/v1/files/${fileId}`,
          extractedText: 'Sample extracted text',
          metadata: {
            originalName: `file-${fileId}.txt`,
            mimeType: 'text/plain',
            uploadedAt: new Date().toISOString(),
            processed: true,
            processedAt: new Date().toISOString(),
            extractedTextLength: 100
          }
        }
      });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get file info' 
      });
    }
  }
}
