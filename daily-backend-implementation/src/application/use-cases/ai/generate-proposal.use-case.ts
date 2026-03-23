/**
 * 生成提案用例
 * 处理AI生成认知模型提案的业务逻辑
 */
import { UUID } from '../../../domain/value-objects/uuid';
import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
import { CognitiveError } from '../../../domain/errors/cognitive-error';

/**
 * 生成提案用例输入参数
 */
export interface GenerateProposalUseCaseInput {
  userId: string;
  thoughtFragmentIds: string[];
}

/**
 * 生成提案用例输出结果
 */
export interface GenerateProposalUseCaseOutput {
  proposal: {
    id: string;
    userId: string;
    title: string;
    description: string;
    concepts: Array<{
      id: string;
      name: string;
      description: string;
      confidenceScore: number;
    }>;
    relations: Array<{
      id: string;
      sourceConceptId: string;
      targetConceptId: string;
      type: string;
      confidenceScore: number;
      description: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * 生成提案用例
 */
export class GenerateProposalUseCase {
  private readonly thoughtFragmentRepository: ThoughtFragmentRepository;

  /**
   * 创建GenerateProposalUseCase实例
   * @param thoughtFragmentRepository 思想片段仓库
   */
  constructor(thoughtFragmentRepository: ThoughtFragmentRepository) {
    this.thoughtFragmentRepository = thoughtFragmentRepository;
  }

  /**
   * 执行生成提案用例
   * @param input 生成提案输入参数
   * @returns 生成提案结果
   */
  async execute(input: GenerateProposalUseCaseInput): Promise<GenerateProposalUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId || !input.thoughtFragmentIds || input.thoughtFragmentIds.length === 0) {
      throw new CognitiveError('User ID and at least one thought fragment ID are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);
    const thoughtFragmentIds = input.thoughtFragmentIds.map(id => UUID.fromString(id));

    // 3. 获取指定的思想片段
    const selectedThoughtFragments = await this.thoughtFragmentRepository.getByIds(thoughtFragmentIds);

    if (selectedThoughtFragments.length === 0) {
      throw new CognitiveError('No valid thought fragments found', 'THOUGHT_FRAGMENTS_NOT_FOUND');
    }

    // 4. 调用AI服务生成提案（模拟实现）
    const proposal = this.generateMockProposal(userId);

    // 5. 构造输出结果
    return {
      proposal
    };
  }

  /**
   * 生成模拟提案（实际项目中应调用AI服务）
   * @param userId 用户ID
   * @returns 模拟提案
   */
  private generateMockProposal(userId: UUID): GenerateProposalUseCaseOutput['proposal'] {
    const now = new Date();
    return {
      id: UUID.generate().getValue(),
      userId: userId.getValue(),
      title: '基于思想片段的认知模型提案',
      description: '这是一个由AI生成的认知模型提案，基于您提供的思想片段',
      concepts: [
        {
          id: UUID.generate().getValue(),
          name: '认知模型',
          description: '描述用户认知结构的模型',
          confidenceScore: 0.9
        },
        {
          id: UUID.generate().getValue(),
          name: '思想片段',
          description: '用户的思想表达片段',
          confidenceScore: 0.85
        },
        {
          id: UUID.generate().getValue(),
          name: 'AI分析',
          description: 'AI对用户认知的分析',
          confidenceScore: 0.8
        }
      ],
      relations: [
        {
          id: UUID.generate().getValue(),
          sourceConceptId: UUID.generate().getValue(),
          targetConceptId: UUID.generate().getValue(),
          type: 'composed_of',
          confidenceScore: 0.85,
          description: '认知模型由思想片段组成'
        },
        {
          id: UUID.generate().getValue(),
          sourceConceptId: UUID.generate().getValue(),
          targetConceptId: UUID.generate().getValue(),
          type: 'influences',
          confidenceScore: 0.8,
          description: 'AI分析影响认知模型'
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }
}
