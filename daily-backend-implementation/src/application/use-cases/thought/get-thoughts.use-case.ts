/**
 * 获取思想片段用例
 * 处理用户获取思想片段列表的业务逻辑
 */
import { ThoughtFragment } from '../../../domain/entities/thought-fragment';
import { UUID } from '../../../domain/value-objects/uuid';
import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
import { CognitiveError } from '../../../domain/errors/cognitive-error';

/**
 * 获取思想片段用例输入参数
 */
export interface GetThoughtsUseCaseInput {
  userId: string;
  isProcessed?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 获取思想片段用例输出结果
 */
export interface GetThoughtsUseCaseOutput {
  thoughtFragments: Array<{
    id: string;
    content: string;
    source: string;
    isProcessed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  totalCount: number;
}

/**
 * 获取思想片段用例
 */
export class GetThoughtsUseCase {
  private readonly thoughtFragmentRepository: ThoughtFragmentRepository;

  /**
   * 创建GetThoughtsUseCase实例
   * @param thoughtFragmentRepository 思想片段仓库
   */
  constructor(thoughtFragmentRepository: ThoughtFragmentRepository) {
    this.thoughtFragmentRepository = thoughtFragmentRepository;
  }

  /**
   * 执行获取思想片段用例
   * @param input 获取思想片段输入参数
   * @returns 获取思想片段结果
   */
  async execute(input: GetThoughtsUseCaseInput): Promise<GetThoughtsUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId) {
      throw new CognitiveError('User ID is required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);

    // 3. 根据条件获取思想片段
    let thoughtFragments: ThoughtFragment[];
    if (input.isProcessed !== undefined) {
      // TODO: 后续实现根据isProcessed过滤的功能
      thoughtFragments = await this.thoughtFragmentRepository.getByUserId(userId);
      thoughtFragments = thoughtFragments.filter(fragment => fragment.getIsProcessed() === input.isProcessed);
    } else {
      thoughtFragments = await this.thoughtFragmentRepository.getByUserId(userId);
    }

    // 4. 应用分页
    const totalCount = thoughtFragments.length;
    const limit = input.limit || 20;
    const offset = input.offset || 0;
    const paginatedThoughtFragments = thoughtFragments
      .sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime())
      .slice(offset, offset + limit);

    // 5. 构造输出结果
    return {
      thoughtFragments: paginatedThoughtFragments.map(fragment => ({
        id: fragment.getId().getValue(),
        content: fragment.getContent(),
        source: fragment.getSource(),
        isProcessed: fragment.getIsProcessed(),
        createdAt: fragment.getCreatedAt(),
        updatedAt: fragment.getUpdatedAt()
      })),
      totalCount
    };
  }
}
