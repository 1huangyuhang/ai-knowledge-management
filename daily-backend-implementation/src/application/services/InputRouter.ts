// src/application/services/InputRouter.ts
import { UnifiedInput } from '../adapters/InputAdapter';

/**
 * 路由目标
 */
export interface RouteDestination {
  flow: string;
  service: string;
  queue: string;
  priority: number;
}

export class InputRouter {
  /**
   * 路由输入
   * @param input 统一输入格式
   * @returns 路由结果
   */
  public routeInput(input: UnifiedInput): RouteDestination {
    const flow = this.determineProcessingFlow(input);
    const destination = this.getRouteDestination(input, flow);
    
    return {
      ...destination,
      priority: input.priority || 0
    };
  }

  /**
   * 确定处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  public determineProcessingFlow(input: UnifiedInput): string {
    switch (input.type) {
      case 'file':
        return this.determineFileProcessingFlow(input);
      case 'speech':
        return 'speech_analysis';
      case 'text':
        return this.determineTextProcessingFlow(input);
      case 'merged':
        return 'merged_analysis';
      default:
        return 'default_analysis';
    }
  }

  /**
   * 确定文件处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  private determineFileProcessingFlow(input: UnifiedInput): string {
    const fileType = input.metadata.fileType || '';
    
    if (fileType.includes('pdf')) {
      return 'pdf_analysis';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'document_analysis';
    } else if (fileType.includes('excel') || fileType.includes('xls')) {
      return 'spreadsheet_analysis';
    } else if (fileType.includes('image')) {
      return 'image_analysis';
    } else {
      return 'text_analysis';
    }
  }

  /**
   * 确定文本处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  private determineTextProcessingFlow(input: UnifiedInput): string {
    const contentLength = input.content.length;
    
    if (contentLength < 100) {
      return 'short_text_analysis';
    } else if (contentLength < 1000) {
      return 'medium_text_analysis';
    } else {
      return 'long_text_analysis';
    }
  }

  /**
   * 获取路由目标
   * @param input 统一输入格式
   * @param flow 处理流程
   * @returns 路由目标
   */
  private getRouteDestination(input: UnifiedInput, flow: string): Omit<RouteDestination, 'priority'> {
    const routeMap: Record<string, Omit<RouteDestination, 'priority'>> = {
      'pdf_analysis': { flow: 'pdf_analysis', service: 'file_service', queue: 'pdf_queue' },
      'document_analysis': { flow: 'document_analysis', service: 'file_service', queue: 'document_queue' },
      'spreadsheet_analysis': { flow: 'spreadsheet_analysis', service: 'file_service', queue: 'spreadsheet_queue' },
      'image_analysis': { flow: 'image_analysis', service: 'file_service', queue: 'image_queue' },
      'text_analysis': { flow: 'text_analysis', service: 'text_service', queue: 'text_queue' },
      'speech_analysis': { flow: 'speech_analysis', service: 'speech_service', queue: 'speech_queue' },
      'short_text_analysis': { flow: 'short_text_analysis', service: 'text_service', queue: 'short_text_queue' },
      'medium_text_analysis': { flow: 'medium_text_analysis', service: 'text_service', queue: 'medium_text_queue' },
      'long_text_analysis': { flow: 'long_text_analysis', service: 'text_service', queue: 'long_text_queue' },
      'merged_analysis': { flow: 'merged_analysis', service: 'cognitive_service', queue: 'merged_queue' },
      'default_analysis': { flow: 'default_analysis', service: 'cognitive_service', queue: 'default_queue' }
    };

    return routeMap[flow] || routeMap.default_analysis;
  }
}