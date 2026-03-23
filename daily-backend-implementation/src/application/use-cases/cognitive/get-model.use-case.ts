/**
 * 获取模型用例
 * 处理获取单个认知模型的业务逻辑
 */
import { CognitiveModel } from '../../../domain/entities/cognitive-model';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveError } from '../../../domain/errors/cognitive-error';

/**
 * 获取模型用例输入参数
 */
export interface GetModelUseCaseInput {
  userId: string;
  modelId: string;
}

/**
 * 获取模型用例输出结果
 */
export interface GetModelUseCaseOutput {
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
 * 获取模型用例
 */
export class GetModelUseCase {
  private readonly cognitiveModelRepository: CognitiveModelRepository;

  /**
   * 创建GetModelUseCase实例
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(cognitiveModelRepository: CognitiveModelRepository) {
    this.cognitiveModelRepository = cognitiveModelRepository;
  }

  /**
   * 执行获取模型用例
   * @param input 获取模型输入参数
   * @returns 获取模型结果
   */
  async execute(input: GetModelUseCaseInput): Promise<GetModelUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId || !input.modelId) {
      throw new CognitiveError('User ID and model ID are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);
    const modelId = UUID.fromString(input.modelId);

    // 3. 获取认知模型
    const cognitiveModel = await this.cognitiveModelRepository.getById(modelId);
    if (!cognitiveModel) {
      throw CognitiveError.modelNotFound(modelId.getValue());
    }

    // 4. 验证模型所属用户
    if (!cognitiveModel.getUserId().equals(userId)) {
      throw new CognitiveError('Unauthorized to access this model', 'UNAUTHORIZED');
    }

    // 5. 构造输出结果
    return {
      model: {
        id: cognitiveModel.getId().getValue(),
        userId: cognitiveModel.getUserId().getValue(),
        name: cognitiveModel.getName(),
        description: cognitiveModel.getDescription(),
        isActive: cognitiveModel.getIsActive(),
        version: cognitiveModel.getVersion(),
        createdAt: cognitiveModel.getCreatedAt(),
        updatedAt: cognitiveModel.getUpdatedAt()
      }
    };
  }
}
