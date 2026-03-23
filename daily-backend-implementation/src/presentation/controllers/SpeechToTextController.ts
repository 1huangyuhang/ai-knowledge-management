import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { AudioProcessorService } from '../../application/services/AudioProcessorService';
import { SpeechRecognitionService } from '../../application/services/SpeechRecognitionService';
import { AudioStorageService } from '../../infrastructure/storage/AudioStorageService';

/**
 * 语音转文本控制器类
 * 处理语音转文本相关的API请求
 */
export class SpeechToTextController {
  private audioProcessorService: AudioProcessorService;
  private speechRecognitionService: SpeechRecognitionService;
  private audioStorageService: AudioStorageService;

  /**
   * 构造函数，通过依赖注入获取服务实例
   */
  constructor() {
    this.audioProcessorService = container.resolve('AudioProcessorService');
    this.speechRecognitionService = container.resolve('SpeechRecognitionService');
    this.audioStorageService = container.resolve('AudioStorageService');
  }

  /**
   * 上传语音文件并转换为文本
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async speechToText(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 解析多部分表单数据
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ success: false, message: 'No audio file uploaded' });
      }
      
      // 读取音频内容
      const audioContent = await data.toBuffer();
      
      // 从文件名获取音频类型
      const fileName = data.filename || 'unknown';
      const audioType = fileName.split('.').pop() || 'unknown';
      
      // 检查音频类型是否支持
      if (!this.audioProcessorService.isSupported(audioType)) {
        return reply.status(400).send({ 
          success: false, 
          message: `Unsupported audio type: ${audioType}` 
        });
      }
      
      // 处理音频文件，提取音频特征和元数据
      const speechInput = await this.audioProcessorService.processAudio(audioContent, audioType);
      
      // 将语音转换为文本
      const transcribedSpeech = await this.speechRecognitionService.recognizeSpeech(speechInput, audioContent);
      
      // 保存音频到存储服务
      const audioUrl = await this.audioStorageService.saveAudio(transcribedSpeech, audioContent);
      
      // 更新语音输入实体的URL
      transcribedSpeech.updateMetadata({ audioUrl });
      
      return reply.send({
        success: true,
        data: {
          speechId: transcribedSpeech.id,
          audioUrl,
          transcription: transcribedSpeech.transcription,
          confidence: transcribedSpeech.confidence,
          language: transcribedSpeech.language,
          duration: transcribedSpeech.duration,
          metadata: transcribedSpeech.metadata
        }
      });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to convert speech to text' 
      });
    }
  }

  /**
   * 获取语音转文本结果
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async getSpeechToTextResult(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { speechId } = request.params as { speechId: string };
      
      // TODO: 实现获取语音转文本结果的逻辑
      // 这里需要从数据库或存储中获取结果
      
      return reply.send({
        success: true,
        data: {
          speechId,
          // 这里返回模拟数据，实际应该从存储中获取
          audioUrl: `http://localhost:3000/api/v1/audio/${speechId}`,
          transcription: 'This is a sample transcription result.',
          confidence: 0.95,
          language: 'en',
          duration: 10.5,
          metadata: {
            originalName: `audio-${speechId}.mp3`,
            mimeType: 'audio/mpeg',
            uploadedAt: new Date().toISOString(),
            processed: true,
            processedAt: new Date().toISOString(),
            transcribed: true,
            transcribedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get speech to text result' 
      });
    }
  }
}
