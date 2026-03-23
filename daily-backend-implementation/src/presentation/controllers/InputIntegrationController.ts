// src/presentation/controllers/InputIntegrationController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable, inject } from 'inversify';
import { Controller } from '../decorators/Controller';
import { Post } from '../decorators/Post';
import { Get } from '../decorators/Get';
import { InputAdapter } from '../../application/adapters/InputAdapter';
import { InputMerger } from '../../application/services/InputMerger';
import { InputRouter } from '../../application/services/InputRouter';
import { InputPrioritizer } from '../../application/services/InputPrioritizer';
import { AITaskRepository } from '../../domain/repositories/AITaskRepository';
import { AITaskStatus } from '../../domain/enums/AITaskStatus';
import { AITask } from '../../domain/entities/AITask';

@Controller('/input-integration')
export class InputIntegrationController {
  constructor(
    @inject(InputAdapter) private inputAdapter: InputAdapter,
    @inject(InputPrioritizer) private inputPrioritizer: InputPrioritizer,
    @inject(InputMerger) private inputMerger: InputMerger,
    @inject(InputRouter) private inputRouter: InputRouter,
    @inject(AITaskRepository) private aiTaskRepository: AITaskRepository
  ) {}

  /**
   * 整合输入
   * @param request Fastify请求
   * @param reply Fastify响应
   */
  @Post('/integrate')
  async integrateInput(request: FastifyRequest, reply: FastifyReply) {
    try {
      const inputData = request.body as any;
      
      // 适配输入格式
      const unifiedInput = this.inputAdapter.normalizeInput(inputData);
      
      // 分配优先级
      const prioritizedInput = this.inputPrioritizer.assignPriority(unifiedInput);
      
      // TODO: 这里可以添加输入历史记录
      
      // 路由输入
      const routeDestination = this.inputRouter.routeInput(prioritizedInput);
      
      // 创建AI任务
      const aiTask = new AITask({
        type: routeDestination.service,
        input: prioritizedInput,
        status: AITaskStatus.PENDING,
        metadata: {
          flow: routeDestination.flow,
          queue: routeDestination.queue,
          priority: routeDestination.priority
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 保存AI任务
      const savedTask = await this.aiTaskRepository.save(aiTask);
      
      reply.code(201).send({
        success: true,
        data: savedTask,
        message: '输入整合成功，已创建AI任务'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        message: '输入整合失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取输入历史
   * @param request Fastify请求
   * @param reply Fastify响应
   */
  @Get('/history')
  async getInputHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      // TODO: 实现输入历史查询逻辑
      reply.code(200).send({
        success: true,
        data: [],
        message: '输入历史查询成功'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        message: '输入历史查询失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取输入统计信息
   * @param request Fastify请求
   * @param reply Fastify响应
   */
  @Get('/statistics')
  async getInputStatistics(request: FastifyRequest, reply: FastifyReply) {
    try {
      // TODO: 实现输入统计逻辑
      reply.code(200).send({
        success: true,
        data: {
          totalInputs: 0,
          inputTypes: {
            file: 0,
            speech: 0,
            text: 0,
            merged: 0
          },
          priorityDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        },
        message: '输入统计信息查询成功'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        message: '输入统计信息查询失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}