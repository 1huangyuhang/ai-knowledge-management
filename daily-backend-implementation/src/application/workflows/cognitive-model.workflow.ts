/**
 * 认知模型工作流
 * 编排认知模型相关的复杂业务流程
 */
import { CreateThoughtUseCase } from '../use-cases/thought/create-thought.use-case';
import { GenerateProposalUseCase } from '../use-cases/ai/generate-proposal.use-case';
import { UpdateModelUseCase } from '../use-cases/cognitive/update-model.use-case';
import { ThoughtFragmentRepository } from '../../domain/repositories/thought-fragment-repository';
import { CognitiveModelRepository } from '../../domain/repositories/cognitive-model-repository';

/**
 * 处理思想片段工作流输入参数
 */
export interface ProcessThoughtFragmentWorkflowInput {
  userId: string;
  content: string;
  source?: string;
}

/**
 * 处理思想片段工作流输出结果
 */
export interface ProcessThoughtFragmentWorkflowOutput {
  thoughtFragmentId: string;
  proposalId?: string;
  updatedModelId?: string;
  status: 'success' | 'partial_success' | 'failed';
  message: string;
}

/**
 * 认知模型工作流
 */
export class CognitiveModelWorkflow {
  private readonly createThoughtUseCase: CreateThoughtUseCase;
  private readonly generateProposalUseCase: GenerateProposalUseCase;
  private readonly updateModelUseCase: UpdateModelUseCase;

  /**
   * 创建CognitiveModelWorkflow实例
   * @param thoughtFragmentRepository 思想片段仓库
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(
    thoughtFragmentRepository: ThoughtFragmentRepository,
    cognitiveModelRepository: CognitiveModelRepository
  ) {
    this.createThoughtUseCase = new CreateThoughtUseCase(thoughtFragmentRepository);
    this.generateProposalUseCase = new GenerateProposalUseCase(thoughtFragmentRepository);
    this.updateModelUseCase = new UpdateModelUseCase(cognitiveModelRepository);
  }

  /**
   * 执行处理思想片段工作流
   * @param input 处理思想片段工作流输入参数
   * @returns 处理思想片段工作流结果
   */
  async executeProcessThoughtFragmentWorkflow(
    input: ProcessThoughtFragmentWorkflowInput
  ): Promise<ProcessThoughtFragmentWorkflowOutput> {
    try {
      // 1. 创建思想片段
      const createThoughtResult = await this.createThoughtUseCase.execute({
        userId: input.userId,
        content: input.content,
        source: input.source
      });

      const thoughtFragmentId = createThoughtResult.thoughtFragment.id;

      // 2. 生成认知模型提案
      // 注意：在实际生产环境中，这一步可能会异步处理，这里为了简化流程同步执行
      const generateProposalResult = await this.generateProposalUseCase.execute({
        userId: input.userId,
        thoughtFragmentIds: [thoughtFragmentId]
      });

      const proposalId = generateProposalResult.proposal.id;

      // 3. TODO: 根据提案更新认知模型
      // 注意：这一步在实际生产环境中可能需要用户确认，这里简化处理

      // 4. 返回成功结果
      return {
        thoughtFragmentId,
        proposalId,
        status: 'success',
        message: 'Thought fragment processed successfully'
      };
    } catch (error: any) {
      // 如果思想片段创建成功，但后续步骤失败，返回部分成功
      if (error.message.includes('THOUGHT_FRAGMENT_CREATED')) {
        return {
          thoughtFragmentId: (error as any).thoughtFragmentId,
          status: 'partial_success',
          message: `Thought fragment created but failed to process: ${error.message}`
        };
      }

      // 否则返回失败
      return {
        thoughtFragmentId: '',
        status: 'failed',
        message: `Failed to process thought fragment: ${error.message}`
      };
    }
  }

  /**
   * 执行批量处理思想片段工作流
   * @param inputs 多个处理思想片段工作流输入参数
   * @returns 多个处理思想片段工作流结果
   */
  async executeBatchProcessThoughtFragmentWorkflow(
    inputs: ProcessThoughtFragmentWorkflowInput[]
  ): Promise<ProcessThoughtFragmentWorkflowOutput[]> {
    const results: ProcessThoughtFragmentWorkflowOutput[] = [];

    for (const input of inputs) {
      const result = await this.executeProcessThoughtFragmentWorkflow(input);
      results.push(result);
    }

    return results;
  }
}
