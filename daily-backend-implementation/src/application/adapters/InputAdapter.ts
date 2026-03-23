// src/application/adapters/InputAdapter.ts
import { FileInput } from '../../domain/entities/file-input';
import { SpeechInput } from '../../domain/entities/speech-input';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
import crypto from 'crypto';

/**
 * 统一输入格式
 */
export interface UnifiedInput {
  id: string;
  type: 'file' | 'speech' | 'text';
  content: string;
  metadata: Record<string, any>;
  source: string;
  createdAt: Date;
  priority?: number;
}

export class InputAdapter {
  /**
   * 适配文件输入
   * @param fileInput 文件输入
   * @returns 统一输入格式
   */
  public adaptFileInput(fileInput: FileInput): UnifiedInput {
    return {
      id: fileInput.id,
      type: 'file',
      content: fileInput.content,
      metadata: {
        ...fileInput.metadata,
        fileName: fileInput.name,
        fileType: fileInput.type,
        fileSize: fileInput.size
      },
      source: 'file_upload',
      createdAt: fileInput.createdAt
    };
  }

  /**
   * 适配语音输入
   * @param speechInput 语音输入
   * @returns 统一输入格式
   */
  public adaptSpeechInput(speechInput: SpeechInput): UnifiedInput {
    return {
      id: speechInput.id,
      type: 'speech',
      content: speechInput.transcription,
      metadata: {
        ...speechInput.metadata,
        audioUrl: speechInput.audioUrl,
        confidence: speechInput.confidence,
        language: speechInput.language,
        duration: speechInput.duration
      },
      source: 'speech_input',
      createdAt: speechInput.createdAt
    };
  }

  /**
   * 适配文字输入
   * @param textInput 文字输入
   * @returns 统一输入格式
   */
  public adaptTextInput(textInput: ThoughtFragment): UnifiedInput {
    return {
      id: textInput.id,
      type: 'text',
      content: textInput.content,
      metadata: {
        ...textInput.metadata,
        tags: textInput.tags
      },
      source: 'text_input',
      createdAt: textInput.createdAt
    };
  }

  /**
   * 标准化输入格式
   * @param input 输入数据
   * @returns 标准化后的输入
   */
  public normalizeInput(input: any): UnifiedInput {
    // 根据输入类型调用相应的适配方法
    if (input instanceof FileInput) {
      return this.adaptFileInput(input);
    } else if (input instanceof SpeechInput) {
      return this.adaptSpeechInput(input);
    } else if (input instanceof ThoughtFragment) {
      return this.adaptTextInput(input);
    } else {
      // 直接输入的文本
      return {
        id: input.id || crypto.randomUUID(),
        type: 'text',
        content: input.content || '',
        metadata: input.metadata || {},
        source: input.source || 'direct_input',
        createdAt: input.createdAt || new Date()
      };
    }
  }
}