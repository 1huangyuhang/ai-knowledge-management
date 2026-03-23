// CognitiveProcessingService类
// 认知处理服务，用于处理认知相关的业务逻辑
import { WorkflowFactory } from '../workflow/workflow-factory';
import { CreateThoughtDto } from '../dtos/create-thought.dto';
import { CognitiveModelDto } from '../dtos/cognitive-model.dto';

export class CognitiveProcessingService {
  private readonly workflowFactory: WorkflowFactory;
  
  /**
   * 创建认知处理服务
   * @param workflowFactory 工作流工厂
   */
  constructor(workflowFactory: WorkflowFactory) {
    this.workflowFactory = workflowFactory;
  }
  
  /**
   * 处理用户思维输入
   * @param input 思维输入数据
   * @returns 更新后的认知模型
   */
  public async processThought(input: CreateThoughtDto): Promise<CognitiveModelDto> {
    const workflow = this.workflowFactory.createCognitiveProcessingWorkflow();
    return await workflow.execute(input);
  }
}
