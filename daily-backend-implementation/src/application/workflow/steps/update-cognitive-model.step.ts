// UpdateCognitiveModelStep类
// 实现工作流步骤，用于更新认知模型
import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { UpdateCognitiveModelUseCase } from '../../use-cases/cognitive/update-model.use-case';
import { CognitiveModelDto } from '../../dtos/cognitive-model.dto';

export class UpdateCognitiveModelStep implements WorkflowStep<void, CognitiveModelDto> {
  private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase;
  
  /**
   * 创建更新认知模型步骤
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(updateCognitiveModelUseCase: UpdateCognitiveModelUseCase) {
    this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
  }
  
  /**
   * 执行更新认知模型步骤
   * @param _ 输入数据（未使用）
   * @param context 工作流上下文
   * @returns 更新后的认知模型
   */
  public async execute(_: void, context: WorkflowContext): Promise<CognitiveModelDto> {
    const proposalId = context.get<string>('proposalId');
    if (!proposalId) {
      throw new Error('Proposal ID not found in context');
    }
    
    const model = await this.updateCognitiveModelUseCase.execute(proposalId);
    context.set('modelId', model.id);
    return model;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'UpdateCognitiveModelStep';
  }
}
