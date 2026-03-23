import { DocumentParserService } from './DocumentParserService';
import { OCRService } from './OCRService';
import { FileInput } from '../../domain/entities/file-input';

/**
 * 文件处理器服务接口
 * 用于处理上传的文件，提取文本内容
 */
export interface FileProcessorService {
  /**
   * 处理文件，提取文本内容
   * @param fileInput 文件输入实体
   * @returns 处理结果，包含提取的文本内容
   */
  processFile(fileInput: FileInput): Promise<{ text: string; processedFile: FileInput }>;
  
  /**
   * 检查文件类型是否支持
   * @param fileType 文件类型
   * @returns 是否支持
   */
  isSupported(fileType: string): boolean;
}

/**
 * 文件处理器服务实现
 * 协调DocumentParserService和OCRService处理不同类型的文件
 */
export class FileProcessorServiceImpl implements FileProcessorService {
  constructor(
    private documentParserService: DocumentParserService,
    private ocrService: OCRService
  ) {}
  
  /**
   * 处理文件，提取文本内容
   * @param fileInput 文件输入实体
   * @returns 处理结果，包含提取的文本内容
   */
  async processFile(fileInput: FileInput): Promise<{ text: string; processedFile: FileInput }> {
    const fileType = this.getFileType(fileInput.name);
    
    if (!this.isSupported(fileType)) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    let text: string;
    
    // 根据文件类型选择不同的处理方式
    if (this.isDocumentType(fileType)) {
      // 处理文档文件
      text = await this.documentParserService.parseDocument(fileInput.content, fileType);
    } else if (this.isImageType(fileType)) {
      // 处理图像文件
      text = await this.ocrService.extractText(fileInput.content, fileType);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    // 更新文件输入实体的元数据
    const updatedFile = fileInput.updateMetadata({
      processed: true,
      processedAt: new Date().toISOString(),
      extractedTextLength: text.length
    });
    
    return {
      text,
      processedFile: updatedFile
    };
  }
  
  /**
   * 检查文件类型是否支持
   * @param fileType 文件类型
   * @returns 是否支持
   */
  isSupported(fileType: string): boolean {
    return this.isDocumentType(fileType) || this.isImageType(fileType);
  }
  
  /**
   * 检查是否为文档类型
   * @param fileType 文件类型
   * @returns 是否为文档类型
   */
  private isDocumentType(fileType: string): boolean {
    return this.documentParserService.isSupported(fileType);
  }
  
  /**
   * 检查是否为图像类型
   * @param fileType 文件类型
   * @returns 是否为图像类型
   */
  private isImageType(fileType: string): boolean {
    return this.ocrService.isSupported(fileType);
  }
  
  /**
   * 从文件名中提取文件类型
   * @param fileName 文件名
   * @returns 文件类型
   */
  private getFileType(fileName: string): string {
    const parts = fileName.split('.');
    if (parts.length < 2) {
      throw new Error('File has no extension');
    }
    return parts[parts.length - 1].toLowerCase();
  }
}