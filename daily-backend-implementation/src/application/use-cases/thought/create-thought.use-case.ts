/**
 * 创建思想片段用例
 * 处理用户创建思想片段的业务逻辑
 */
import { ThoughtFragment, ThoughtFragmentImpl } from '../../../domain/entities/thought-fragment';
import { UUID } from '../../../domain/value-objects/uuid';
import { ThoughtFragmentRepository } from '../../../domain/repositories/thought-fragment-repository';
import { ThoughtInput, ThoughtInputValidator } from '../../../infrastructure/validators/thought-input.validator';
import { ThoughtInputFormatter } from '../../../infrastructure/formatters/thought-input.formatter';

/**
 * 创建思想片段用例输入参数
 */
export interface CreateThoughtUseCaseInput {
  userId: string;
  content: string;
  source?: string;
}

/**
 * 创建思想片段用例输出结果
 */
export interface CreateThoughtUseCaseOutput {
  thoughtFragment: {
    id: string;
    content: string;
    source: string;
    isProcessed: boolean;
    createdAt: Date;
    updatedAt: Date;
    keywords: string[];
  };
}

/**
 * 创建思想片段用例
 */
export class CreateThoughtUseCase {
  private readonly thoughtFragmentRepository: ThoughtFragmentRepository;

  /**
   * 创建CreateThoughtUseCase实例
   * @param thoughtFragmentRepository 思想片段仓库
   */
  constructor(thoughtFragmentRepository: ThoughtFragmentRepository) {
    this.thoughtFragmentRepository = thoughtFragmentRepository;
  }

  /**
   * 执行创建思想片段用例
   * @param input 创建思想片段输入参数
   * @returns 创建思想片段结果
   */
  async execute(input: CreateThoughtUseCaseInput): Promise<CreateThoughtUseCaseOutput> {
    // 1. 验证输入参数
    const validatedInput = ThoughtInputValidator.validate(input);

    // 2. 格式化输入参数
    const formattedInput = ThoughtInputFormatter.format(validatedInput);

    // 3. 提取关键词
    const keywords = ThoughtInputFormatter.extractKeywords(formattedInput.content);

    // 4. 创建思想片段实体
    const thoughtFragment = new ThoughtFragmentImpl(
      UUID.generate().toString(),
      formattedInput.content,
      formattedInput.userId,
      { 
        source: formattedInput.source,
        keywords
      },
      false,
      0,
      null,
      new Date()
    );

    // 5. 保存思想片段到仓库
    const createdThoughtFragment = await this.thoughtFragmentRepository.create(thoughtFragment);

    // 6. 构造输出结果
    return {
      thoughtFragment: {
        id: createdThoughtFragment.id,
        content: createdThoughtFragment.content,
        source: createdThoughtFragment.metadata?.source || 'manual',
        isProcessed: createdThoughtFragment.isProcessed,
        createdAt: createdThoughtFragment.createdAt,
        updatedAt: createdThoughtFragment.updatedAt,
        keywords: createdThoughtFragment.metadata?.keywords || []
      }
    };
  }
}
