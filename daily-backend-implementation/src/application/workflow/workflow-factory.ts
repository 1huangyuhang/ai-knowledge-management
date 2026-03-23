// WorkflowFactory类
// 用于创建各种工作流实例
import { Workflow } from '../interfaces/workflow/workflow.interface';
import { WorkflowImpl } from './workflow.impl';
import { IngestThoughtUseCase } from '../use-cases/thought/create-thought.use-case';
import { GenerateProposalUseCase } from '../use-cases/cognitive/generate-proposal.use-case';
import { UpdateCognitiveModelUseCase } from '../use-cases/cognitive/update-model.use-case';
import { IngestThoughtStep } from './steps/ingest-thought.step';
import { GenerateProposalStep } from './steps/generate-proposal.step';
import { UpdateCognitiveModelStep } from './steps/update-cognitive-model.step';
import { CreateThoughtDto } from '../dtos/create-thought.dto';
import { CognitiveModelDto } from '../dtos/cognitive-model.dto';

export class WorkflowFactory {
  private readonly ingestThoughtUseCase: IngestThoughtUseCase;
  private readonly generateProposalUseCase: GenerateProposalUseCase;
  private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase;
  
  /**
   * 创建工作流工厂
   * @param ingestThoughtUseCase 输入思想片段用例
   * @param generateProposalUseCase 生成建议用例
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(
    ingestThoughtUseCase: IngestThoughtUseCase,
    generateProposalUseCase: GenerateProposalUseCase,
    updateCognitiveModelUseCase: UpdateCognitiveModelUseCase
  ) {
    this.ingestThoughtUseCase = ingestThoughtUseCase;
    this.generateProposalUseCase = generateProposalUseCase;
    this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
  }
  
  /**
   * 创建完整的认知处理工作流
   * @returns 认知处理工作流
   */
  public createCognitiveProcessingWorkflow(): Workflow<CreateThoughtDto, CognitiveModelDto> {
    const workflow = new WorkflowImpl<CreateThoughtDto, CognitiveModelDto>('CognitiveProcessingWorkflow');
    
    // 添加工作流步骤
    workflow.addStep(new IngestThoughtStep(this.ingestThoughtUseCase));
    workflow.addStep(new GenerateProposalStep(this.generateProposalUseCase));
    workflow.addStep(new UpdateCognitiveModelStep(this.updateCognitiveModelUseCase));
    
    return workflow;
  }
}
