// GenerateProposalStep类
// 实现工作流步骤，用于生成认知建议
import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { GenerateProposalUseCase } from '../../use-cases/cognitive/generate-proposal.use-case';
import { CognitiveProposalDto } from '../../dtos/cognitive-proposal.dto';

export class GenerateProposalStep implements WorkflowStep<void, CognitiveProposalDto> {
  private readonly generateProposalUseCase: GenerateProposalUseCase;
  
  /**
   * 创建生成建议步骤
   * @param generateProposalUseCase 生成建议用例
   */
  constructor(generateProposalUseCase: GenerateProposalUseCase) {
    this.generateProposalUseCase = generateProposalUseCase;
  }
  
  /**
   * 执行生成建议步骤
   * @param _ 输入数据（未使用）
   * @param context 工作流上下文
   * @returns 认知建议
   */
  public async execute(_: void, context: WorkflowContext): Promise<CognitiveProposalDto> {
    const thoughtId = context.get<string>('thoughtId');
    if (!thoughtId) {
      throw new Error('Thought ID not found in context');
    }
    
    const proposal = await this.generateProposalUseCase.execute(thoughtId);
    context.set('proposalId', proposal.id);
    return proposal;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'GenerateProposalStep';
  }
}
