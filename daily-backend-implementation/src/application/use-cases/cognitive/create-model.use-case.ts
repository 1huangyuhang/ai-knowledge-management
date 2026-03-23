/**
 * 创建认知模型用例
 * 处理创建新认知模型的业务逻辑
 */
import { CognitiveModel } from '../../../domain/entities/cognitive-model';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveError } from '../../../domain/errors/cognitive-error';

/**
 * 创建认知模型用例输入参数
 */
export interface CreateModelUseCaseInput {
  userId: string;
  name: string;
  description: string;
}

/**
 * 创建认知模型用例输出结果
 */
export interface CreateModelUseCaseOutput {
  model: {
    id: string;
    userId: string;
    name: string;
    description: string;
    isActive: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * 创建认知模型用例
 */
export class CreateModelUseCase {
  private readonly cognitiveModelRepository: CognitiveModelRepository;

  /**
   * 创建CreateModelUseCase实例
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(cognitiveModelRepository: CognitiveModelRepository) {
    this.cognitiveModelRepository = cognitiveModelRepository;
  }

  /**
   * 执行创建认知模型用例
   * @param input 创建认知模型输入参数
   * @returns 创建认知模型结果
   */
  async execute(input: CreateModelUseCaseInput): Promise<CreateModelUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId || !input.name || !input.description) {
      throw new CognitiveError('User ID, name and description are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);

    // 3. 创建认知模型实体
    const cognitiveModel = new CognitiveModel({
      userId,
      name: input.name,
      description: input.description
    });

    // 4. 保存认知模型到仓库
    const createdModel = await this.cognitiveModelRepository.create(cognitiveModel);

    // 5. 构造输出结果
    return {
      model: {
        id: createdModel.getId().getValue(),
        userId: createdModel.getUserId().getValue(),
        name: createdModel.getName(),
        description: createdModel.getDescription(),
        isActive: createdModel.getIsActive(),
        version: createdModel.getVersion(),
        createdAt: createdModel.getCreatedAt(),
        updatedAt: createdModel.getUpdatedAt()
      }
    };
  }
}
