import { inject, injectable } from 'inversify';
import { WhisperAPIClient } from '../../infrastructure/ai/WhisperAPIClient';
import { SpeechInput } from '../../domain/entities/speech-input';

/**
 * 语音识别服务接口
 * 用于将语音转换为文本
 */
export interface SpeechRecognitionService {
  /**
   * 将语音转换为文本
   * @param speechInput 语音输入实体
   * @param audioContent 音频内容
   * @returns 包含转录文本的语音输入实体
   */
  recognizeSpeech(speechInput: SpeechInput, audioContent: Buffer): Promise<SpeechInput>;
  
  /**
   * 检查音频类型是否支持
   * @param audioType 音频类型
   * @returns 是否支持
   */
  isSupported(audioType: string): boolean;
}

/**
 * 语音识别服务实现
 * 使用Whisper API将语音转换为文本
 */
@injectable()
export class SpeechRecognitionServiceImpl implements SpeechRecognitionService {
  private supportedTypes = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
  
  constructor(
    @inject('WhisperAPIClient') private whisperAPIClient: WhisperAPIClient
  ) {}
  
  /**
   * 将语音转换为文本
   * @param speechInput 语音输入实体
   * @param audioContent 音频内容
   * @returns 包含转录文本的语音输入实体
   */
  async recognizeSpeech(speechInput: SpeechInput, audioContent: Buffer): Promise<SpeechInput> {
    // 调用Whisper API进行语音识别
    const transcriptionResult = await this.whisperAPIClient.transcribeAudio(audioContent);
    
    // 更新语音输入实体的转录结果
    const updatedSpeechInput = speechInput.updateTranscription(
      transcriptionResult.text,
      transcriptionResult.confidence || 0,
      transcriptionResult.language || 'en'
    );
    
    // 更新元数据
    updatedSpeechInput.updateMetadata({
      transcribed: true,
      transcribedAt: new Date().toISOString()
    });
    
    return updatedSpeechInput;
  }
  
  /**
   * 检查音频类型是否支持
   * @param audioType 音频类型
   * @returns 是否支持
   */
  isSupported(audioType: string): boolean {
    return this.supportedTypes.includes(audioType.toLowerCase());
  }
}