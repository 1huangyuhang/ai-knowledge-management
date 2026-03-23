import { UUID } from '../value-objects/UUID';
import { CodeAnalysis } from '../entities/CodeAnalysis';

export interface CreateCodeAnalysisDto {
  projectId: string;
  filePath: string;
  analysisType?: string;
  configuration?: Record<string, any>;
}

export interface CodeAnalysisService {
  /**
   * 创建代码分析任务
   */
  createAnalysis(dto: CreateCodeAnalysisDto): Promise<CodeAnalysis>;

  /**
   * 获取代码分析详情
   */
  getAnalysisById(id: UUID): Promise<CodeAnalysis | null>;

  /**
   * 获取项目的代码分析列表
   */
  getAnalysesByProject(projectId: string): Promise<CodeAnalysis[]>;

  /**
   * 执行代码分析
   */
  executeAnalysis(id: UUID): Promise<CodeAnalysis>;

  /**
   * 更新代码分析结果
   */
  updateAnalysisResults(
    id: UUID,
    metrics: any[],
    issues: any[],
    status: string
  ): Promise<CodeAnalysis>;

  /**
   * 删除代码分析
   */
  deleteAnalysis(id: UUID): Promise<boolean>;
}
