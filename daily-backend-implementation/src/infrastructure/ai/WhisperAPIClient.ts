// src/infrastructure/ai/WhisperAPIClient.ts
import OpenAI from 'openai';
import fs from 'fs';

/**
 * Whisper API转录结果
 */
export interface WhisperTranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

/**
 * Whisper API客户端接口
 */
export interface WhisperAPIClient {
  /**
   * 调用Whisper API进行语音转录
   * @param audioPath 音频文件路径
   * @param language 语言代码
   * @returns 转录结果
   */
  transcribe(audioPath: string, language?: string): Promise<WhisperTranscriptionResult>;

  /**
   * 调用Whisper API进行语音翻译
   * @param audioPath 音频文件路径
   * @param targetLanguage 目标语言
   * @returns 翻译结果
   */
  translate(audioPath: string, targetLanguage: string): Promise<WhisperTranscriptionResult>;
}

/**
 * OpenAI Whisper API客户端实现
 */
export class OpenAIWhisperAPIClient implements WhisperAPIClient {
  private readonly openai: OpenAI;

  constructor() {
    // 从环境变量获取OpenAI API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey
    });
  }

  /**
   * 调用Whisper API进行语音转录
   * @param audioPath 音频文件路径
   * @param language 语言代码
   * @returns 转录结果
   */
  public async transcribe(
    audioPath: string,
    language?: string
  ): Promise<WhisperTranscriptionResult> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // 调用Whisper API进行转录
      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language,
        response_format: 'json',
        timestamp_granularities: ['segment'],
        temperature: 0.0
      });

      // 转换响应格式
      return {
        text: response.text,
        confidence: response.segments?.[0]?.confidence || 0.9,
        segments: response.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          confidence: segment.confidence
        }))
      };
    } catch (error: any) {
      console.error('Whisper API transcription failed:', error);
      throw new Error(`Whisper API transcription failed: ${error.message}`);
    }
  }

  /**
   * 调用Whisper API进行语音翻译
   * @param audioPath 音频文件路径
   * @param targetLanguage 目标语言
   * @returns 翻译结果
   */
  public async translate(
    audioPath: string,
    targetLanguage: string
  ): Promise<WhisperTranscriptionResult> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // 调用Whisper API进行翻译
      const response = await this.openai.audio.translations.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        response_format: 'json',
        timestamp_granularities: ['segment'],
        temperature: 0.0
      });

      // 转换响应格式
      return {
        text: response.text,
        confidence: response.segments?.[0]?.confidence || 0.9,
        segments: response.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          confidence: segment.confidence
        }))
      };
    } catch (error: any) {
      console.error('Whisper API translation failed:', error);
      throw new Error(`Whisper API translation failed: ${error.message}`);
    }
  }
}