// src/presentation/controllers/input-integration.controller.ts
import { injectable } from 'inversify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { InputAdapter, UnifiedInput } from '../../application/adapters/InputAdapter';
import { InputMerger } from '../../application/services/InputMerger';
import { InputPrioritizer } from '../../application/services/InputPrioritizer';
import { InputRouter } from '../../application/services/InputRouter';
import { FileInput } from '../../domain/entities/file-input';
import { SpeechInput } from '../../domain/entities/speech-input';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
import { InputRepository } from '../../domain/repositories/input-repository';
import { AITaskRepository } from '../../domain/repositories/ai-task-repository';
import { UUID } from '../../domain/value-objects/uuid';

@injectable()
export class InputIntegrationController {
  constructor(
    private readonly inputAdapter: InputAdapter,
    private readonly inputMerger: InputMerger,
    private readonly inputPrioritizer: InputPrioritizer,
    private readonly inputRouter: InputRouter,
    private readonly inputRepository: InputRepository,
    private readonly aiTaskRepository: AITaskRepository
  ) {}

  /**
   * 整合输入
   * @param req 请求对象
   * @param res 响应对象
   */
  public async integrateInput(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const { input, type, metadata } = req.body as any;
      const userId = new UUID(req.user?.id || '');

      // 根据输入类型创建相应的输入实体
      let inputEntity: FileInput | SpeechInput | ThoughtFragment;
      let unifiedInput: UnifiedInput;

      switch (type) {
        case 'file':
          inputEntity = FileInput.create({
            name: input.name,
            type: input.mimeType,
            size: input.size,
            content: input.content,
            metadata: metadata || {},
            userId
          });
          await this.inputRepository.saveFileInput(inputEntity as FileInput);
          unifiedInput = this.inputAdapter.adaptFileInput(inputEntity as FileInput);
          break;

        case 'speech':
          inputEntity = SpeechInput.create({
            audioUrl: input.audioUrl,
            transcription: input.transcription,
            confidence: input.confidence || 0.0,
            language: input.language || 'en',
            duration: input.duration || 0.0,
            metadata: metadata || {},
            userId
          });
          await this.inputRepository.saveSpeechInput(inputEntity as SpeechInput);
          unifiedInput = this.inputAdapter.adaptSpeechInput(inputEntity as SpeechInput);
          break;

        case 'text':
          inputEntity = ThoughtFragment.create({
            content: input.content,
            metadata: metadata || {},
            tags: input.tags || [],
            userId
          });
          unifiedInput = this.inputAdapter.adaptTextInput(inputEntity as ThoughtFragment);
          break;

        default:
          return res.status(400).send({
            error: 'Invalid input type',
            message: 'Input type must be one of: file, speech, text'
          });
      }

      // 为输入分配优先级
      const prioritizedInput = this.inputPrioritizer.assignPriority(unifiedInput);

      // 路由输入
      const routeDestination = this.inputRouter.routeInput(prioritizedInput);

      // 创建AI任务
      const aiTask = await this.aiTaskRepository.create({
        type: 'COGNITIVE_ANALYSIS',
        input: prioritizedInput,
        status: 'PENDING',
        metadata: {
          routeDestination,
          source: prioritizedInput.source
        },
        userId
      });

      return res.status(200).send({
        message: 'Input integrated successfully',
        data: {
          inputId: inputEntity.id.value,
          aiTaskId: aiTask.id.value,
          routeDestination,
          priority: prioritizedInput.priority
        }
      });
    } catch (error) {
      return res.status(500).send({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  }

  /**
   * 获取输入历史
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getInputHistory(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const { limit = 10, offset = 0 } = req.query as any;
      const userId = new UUID(req.user?.id || '');

      const inputHistory = await this.inputRepository.getUserInputHistory(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      // 转换为统一输入格式
      const unifiedInputs = inputHistory.map(input => {
        if (input instanceof FileInput) {
          return this.inputAdapter.adaptFileInput(input);
        } else if (input instanceof SpeechInput) {
          return this.inputAdapter.adaptSpeechInput(input);
        }
        return this.inputAdapter.normalizeInput(input);
      });

      return res.status(200).send({
        message: 'Input history retrieved successfully',
        data: unifiedInputs
      });
    } catch (error) {
      return res.status(500).send({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  }

  /**
   * 获取输入统计信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getInputStatistics(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const userId = new UUID(req.user?.id || '');
      const statistics = await this.inputRepository.getUserInputStatistics(userId);

      return res.status(200).send({
        message: 'Input statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      return res.status(500).send({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  }

  /**
   * 合并输入
   * @param req 请求对象
   * @param res 响应对象
   */
  public async mergeInputs(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const { inputIds } = req.body as any;
      const userId = new UUID(req.user?.id || '');

      // 获取输入实体
      const inputs: Array<FileInput | SpeechInput> = [];
      for (const id of inputIds) {
        const fileInput = await this.inputRepository.getFileInputById(new UUID(id));
        if (fileInput) {
          inputs.push(fileInput);
          continue;
        }
        const speechInput = await this.inputRepository.getSpeechInputById(new UUID(id));
        if (speechInput) {
          inputs.push(speechInput);
        }
      }

      // 转换为统一输入格式
      const unifiedInputs = inputs.map(input => {
        if (input instanceof FileInput) {
          return this.inputAdapter.adaptFileInput(input);
        }
        return this.inputAdapter.adaptSpeechInput(input as SpeechInput);
      });

      // 合并输入
      const mergedInputs = this.inputMerger.mergeInputs(unifiedInputs);
      const mergedInput = mergedInputs[0]; // 假设只合并为一个

      // 为合并后的输入分配优先级
      const prioritizedInput = this.inputPrioritizer.assignPriority(mergedInput);

      // 创建AI任务
      const aiTask = await this.aiTaskRepository.create({
        type: 'COGNITIVE_ANALYSIS',
        input: prioritizedInput,
        status: 'PENDING',
        metadata: {
          merged: true,
          originalInputs: inputIds,
          source: mergedInput.source
        },
        userId
      });

      return res.status(200).send({
        message: 'Inputs merged successfully',
        data: {
          mergedInput: prioritizedInput,
          aiTaskId: aiTask.id.value
        }
      });
    } catch (error) {
      return res.status(500).send({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  }
}