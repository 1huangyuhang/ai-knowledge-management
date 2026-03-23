// IngestThoughtStep类
// 实现工作流步骤，用于摄入思想片段
import { WorkflowStep } from '../../interfaces/workflow/workflow-step.interface';
import { WorkflowContext } from '../../interfaces/workflow/workflow-context.interface';
import { IngestThoughtUseCase } from '../../use-cases/thought/create-thought.use-case';
import { CreateThoughtDto } from '../../dtos/create-thought.dto';
import { ThoughtDto } from '../../dtos/thought.dto';

export class IngestThoughtStep implements WorkflowStep<CreateThoughtDto, ThoughtDto> {
  private readonly ingestThoughtUseCase: IngestThoughtUseCase;
  
  /**
   * 创建思想片段输入步骤
   * @param ingestThoughtUseCase 输入思想片段用例
   */
  constructor(ingestThoughtUseCase: IngestThoughtUseCase) {
    this.ingestThoughtUseCase = ingestThoughtUseCase;
  }
  
  /**
   * 执行思想片段输入步骤
   * @param input 思想片段输入数据
   * @param context 工作流上下文
   * @returns 思想片段输出结果
   */
  public async execute(input: CreateThoughtDto, context: WorkflowContext): Promise<ThoughtDto> {
    const result = await this.ingestThoughtUseCase.execute(input);
    context.set('thoughtId', result.id);
    return result;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'IngestThoughtStep';
  }
}
