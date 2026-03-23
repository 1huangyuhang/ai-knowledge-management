/**
 * OCR服务接口
 * 用于从图像中提取文本
 */
export interface OCRService {
  /**
   * 从图像中提取文本
   * @param imageContent 图像内容
   * @param imageType 图像类型
   * @returns 提取的文本内容
   */
  extractText(imageContent: Buffer, imageType: string): Promise<string>;
  
  /**
   * 检查图像类型是否支持
   * @param imageType 图像类型
   * @returns 是否支持
   */
  isSupported(imageType: string): boolean;
}

/**
 * OCR服务实现
 * 支持从图像中提取文本
 */
export class OCRServiceImpl implements OCRService {
  private supportedTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  
  /**
   * 从图像中提取文本
   * @param imageContent 图像内容
   * @param imageType 图像类型
   * @returns 提取的文本内容
   */
  async extractText(imageContent: Buffer, imageType: string): Promise<string> {
    if (!this.isSupported(imageType)) {
      throw new Error(`Unsupported image type: ${imageType}`);
    }
    
    // TODO: 实现OCR逻辑，这里暂时返回模拟数据
    // 实际实现中应该调用OCR API或本地OCR库
    return 'This is sample text extracted from the image.';
  }
  
  /**
   * 检查图像类型是否支持
   * @param imageType 图像类型
   * @returns 是否支持
   */
  isSupported(imageType: string): boolean {
    return this.supportedTypes.includes(imageType.toLowerCase());
  }
}