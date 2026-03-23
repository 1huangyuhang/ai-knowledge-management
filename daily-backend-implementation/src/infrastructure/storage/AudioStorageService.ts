// src/infrastructure/storage/AudioStorageService.ts
import { injectable } from 'inversify';

/**
 * 音频存储服务接口
 */
export interface AudioStorageService {
  /**
   * 保存音频文件
   * @param audio 音频缓冲区
   * @param filename 文件名
   * @param mimeType 音频MIME类型
   * @returns 保存后的音频路径
   */
  saveAudio(audio: Buffer, filename: string, mimeType: string): Promise<string>;

  /**
   * 获取音频路径
   * @param audioId 音频ID
   * @returns 音频路径
   */
  getAudioPath(audioId: string): Promise<string>;

  /**
   * 删除音频文件
   * @param audioId 音频ID
   * @returns 是否删除成功
   */
  deleteAudio(audioId: string): Promise<boolean>;

  /**
   * 获取音频URL
   * @param audioId 音频ID
   * @returns 音频访问URL
   */
  getAudioUrl(audioId: string): Promise<string>;

  /**
   * 检查音频是否存在
   * @param audioId 音频ID
   * @returns 音频是否存在
   */
  audioExists(audioId: string): Promise<boolean>;

  /**
   * 获取音频元数据
   * @param audioId 音频ID
   * @returns 音频元数据
   */
  getAudioMetadata(audioId: string): Promise<{
    filename: string;
    mimeType: string;
    size: number;
    duration?: number;
    sampleRate?: number;
    bitRate?: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * 本地音频存储服务实现
 */
@injectable()
export class LocalAudioStorageService implements AudioStorageService {
  private readonly audioDir: string;

  constructor() {
    this.audioDir = './audio-uploads';
    // 确保音频目录存在
    this.ensureAudioDirExists();
  }

  /**
   * 确保音频目录存在
   */
  private ensureAudioDirExists(): void {
    const fs = require('fs');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * 保存音频文件
   * @param audio 音频缓冲区
   * @param filename 文件名
   * @param mimeType 音频MIME类型
   * @returns 保存后的音频路径
   */
  async saveAudio(audio: Buffer, filename: string, mimeType: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = path.extname(filename) || this.getExtensionFromMimeType(mimeType);
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 10)}${extension}`;
    const audioPath = path.join(this.audioDir, uniqueFilename);

    // 保存音频文件
    await fs.promises.writeFile(audioPath, audio);

    // 返回音频路径
    return audioPath;
  }

  /**
   * 根据MIME类型获取音频扩展名
   * @param mimeType 音频MIME类型
   * @returns 音频扩展名
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/mp4': '.m4a',
      'audio/ogg': '.ogg',
      'audio/webm': '.webm',
      'audio/flac': '.flac',
      'audio/aac': '.aac'
    };

    return mimeToExt[mimeType] || '.mp3';
  }

  /**
   * 获取音频路径
   * @param audioId 音频ID
   * @returns 音频路径
   */
  async getAudioPath(audioId: string): Promise<string> {
    const path = require('path');
    const audioPath = path.join(this.audioDir, audioId);
    return audioPath;
  }

  /**
   * 删除音频文件
   * @param audioId 音频ID
   * @returns 是否删除成功
   */
  async deleteAudio(audioId: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    try {
      const audioPath = path.join(this.audioDir, audioId);
      await fs.promises.unlink(audioPath);
      return true;
    } catch (error) {
      console.error('Error deleting audio:', error);
      return false;
    }
  }

  /**
   * 获取音频URL
   * @param audioId 音频ID
   * @returns 音频访问URL
   */
  async getAudioUrl(audioId: string): Promise<string> {
    // 对于本地存储，返回相对路径
    return `/audio-uploads/${audioId}`;
  }

  /**
   * 检查音频是否存在
   * @param audioId 音频ID
   * @returns 音频是否存在
   */
  async audioExists(audioId: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    const audioPath = path.join(this.audioDir, audioId);
    return fs.existsSync(audioPath);
  }

  /**
   * 获取音频元数据
   * @param audioId 音频ID
   * @returns 音频元数据
   */
  async getAudioMetadata(audioId: string): Promise<{
    filename: string;
    mimeType: string;
    size: number;
    duration?: number;
    sampleRate?: number;
    bitRate?: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const fs = require('fs');
    const path = require('path');

    const audioPath = path.join(this.audioDir, audioId);
    const stats = await fs.promises.stat(audioPath);

    // 尝试获取音频时长等元数据
    // 注意：这里需要FFmpeg或其他音频处理库，当前版本只返回基础元数据
    return {
      filename: audioId,
      mimeType: 'audio/mpeg', // 本地存储无法直接获取MIME类型，返回默认值
      size: stats.size,
      duration: undefined, // 需要FFmpeg才能获取
      sampleRate: undefined, // 需要FFmpeg才能获取
      bitRate: undefined, // 需要FFmpeg才能获取
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
  }
}