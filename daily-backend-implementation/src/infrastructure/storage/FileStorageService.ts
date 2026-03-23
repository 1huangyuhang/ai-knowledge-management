// src/infrastructure/storage/FileStorageService.ts
import { injectable } from 'inversify';

/**
 * 文件存储服务接口
 */
export interface FileStorageService {
  /**
   * 保存文件
   * @param file 文件缓冲区
   * @param filename 文件名
   * @param mimeType 文件MIME类型
   * @returns 保存后的文件路径
   */
  saveFile(file: Buffer, filename: string, mimeType: string): Promise<string>;

  /**
   * 获取文件路径
   * @param fileId 文件ID
   * @returns 文件路径
   */
  getFilePath(fileId: string): Promise<string>;

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 是否删除成功
   */
  deleteFile(fileId: string): Promise<boolean>;

  /**
   * 获取文件URL
   * @param fileId 文件ID
   * @returns 文件访问URL
   */
  getFileUrl(fileId: string): Promise<string>;

  /**
   * 检查文件是否存在
   * @param fileId 文件ID
   * @returns 文件是否存在
   */
  fileExists(fileId: string): Promise<boolean>;

  /**
   * 获取文件元数据
   * @param fileId 文件ID
   * @returns 文件元数据
   */
  getFileMetadata(fileId: string): Promise<{
    filename: string;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * 本地文件存储服务实现
 */
@injectable()
export class LocalFileStorageService implements FileStorageService {
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = './uploads';
    // 确保上传目录存在
    this.ensureUploadsDirExists();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadsDirExists(): void {
    const fs = require('fs');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * 保存文件
   * @param file 文件缓冲区
   * @param filename 文件名
   * @param mimeType 文件MIME类型
   * @returns 保存后的文件路径
   */
  async saveFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = path.extname(filename) || this.getExtensionFromMimeType(mimeType);
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 10)}${extension}`;
    const filePath = path.join(this.uploadsDir, uniqueFilename);

    // 保存文件
    await fs.promises.writeFile(filePath, file);

    // 返回文件路径
    return filePath;
  }

  /**
   * 根据MIME类型获取文件扩展名
   * @param mimeType 文件MIME类型
   * @returns 文件扩展名
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'text/plain': '.txt',
      'text/html': '.html',
      'text/markdown': '.md',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'video/mp4': '.mp4'
    };

    return mimeToExt[mimeType] || '.bin';
  }

  /**
   * 获取文件路径
   * @param fileId 文件ID
   * @returns 文件路径
   */
  async getFilePath(fileId: string): Promise<string> {
    const path = require('path');
    const filePath = path.join(this.uploadsDir, fileId);
    return filePath;
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 是否删除成功
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    try {
      const filePath = path.join(this.uploadsDir, fileId);
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * 获取文件URL
   * @param fileId 文件ID
   * @returns 文件访问URL
   */
  async getFileUrl(fileId: string): Promise<string> {
    // 对于本地存储，返回相对路径
    return `/uploads/${fileId}`;
  }

  /**
   * 检查文件是否存在
   * @param fileId 文件ID
   * @returns 文件是否存在
   */
  async fileExists(fileId: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(this.uploadsDir, fileId);
    return fs.existsSync(filePath);
  }

  /**
   * 获取文件元数据
   * @param fileId 文件ID
   * @returns 文件元数据
   */
  async getFileMetadata(fileId: string): Promise<{
    filename: string;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(this.uploadsDir, fileId);
    const stats = await fs.promises.stat(filePath);

    return {
      filename: fileId,
      mimeType: 'application/octet-stream', // 本地存储无法直接获取MIME类型，返回默认值
      size: stats.size,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
  }
}