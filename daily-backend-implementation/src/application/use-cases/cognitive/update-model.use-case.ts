/**
 * 更新模型用例
 * 处理更新认知模型的业务逻辑
 */
import { CognitiveModel } from '../../../domain/entities/cognitive-model';
import { UUID } from '../../../domain/value-objects/uuid';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { CognitiveError } from '../../../domain/errors/cognitive-error';

/**
 * 更新模型用例输入参数
 */
export interface UpdateModelUseCaseInput {
  userId: string;
  modelId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * 更新模型用例输出结果
 */
export interface UpdateModelUseCaseOutput {
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
 * 更新模型用例
 */
export class UpdateModelUseCase {
  private readonly cognitiveModelRepository: CognitiveModelRepository;

  /**
   * 创建UpdateModelUseCase实例
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(cognitiveModelRepository: CognitiveModelRepository) {
    this.cognitiveModelRepository = cognitiveModelRepository;
  }

  /**
   * 执行更新模型用例
   * @param input 更新模型输入参数
   * @returns 更新模型结果
   */
  async execute(input: UpdateModelUseCaseInput): Promise<UpdateModelUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId || !input.modelId) {
      throw new CognitiveError('User ID and model ID are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);
    const modelId = UUID.fromString(input.modelId);

    // 3. 获取当前认知模型
    const existingModel = await this.cognitiveModelRepository.getById(modelId);
    if (!existingModel) {
      throw CognitiveError.modelNotFound(modelId.getValue());
    }

    // 4. 验证模型所属用户
    if (!existingModel.getUserId().equals(userId)) {
      throw new CognitiveError('Unauthorized to update this model', 'UNAUTHORIZED');
    }

    // 5. 更新模型属性
    if (input.name !== undefined) {
      existingModel.setName(input.name);
    }

    if (input.description !== undefined) {
      existingModel.setDescription(input.description);
    }

    if (input.isActive !== undefined) {
      if (input.isActive) {
        existingModel.activate();
      } else {
        existingModel.deactivate();
      }
    }

    // 6. 保存更新后的模型
    const updatedModel = await this.cognitiveModelRepository.update(existingModel);

    // 7. 构造输出结果
    return {
      model: {
        id: updatedModel.getId().getValue(),
        userId: updatedModel.getUserId().getValue(),
        name: updatedModel.getName(),
        description: updatedModel.getDescription(),
        isActive: updatedModel.getIsActive(),
        version: updatedModel.getVersion(),
        createdAt: updatedModel.getCreatedAt(),
        updatedAt: updatedModel.getUpdatedAt()
      }
    };
  }
}
