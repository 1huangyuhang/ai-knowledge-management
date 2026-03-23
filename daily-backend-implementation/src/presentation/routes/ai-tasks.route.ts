/**
 * AI任务相关路由
 * 处理AI任务的创建、查询和状态查询等功能
 */
import { FastifyInstance } from 'fastify';

/**
 * 配置AI任务路由
 * @param instance FastifyInstance
 */
export async function configureAiTasksRoutes(instance: FastifyInstance): Promise<void> {
  // 注册路由组
  instance.register((aiTasksInstance, _, done) => {
    // 健康检查路由
    aiTasksInstance.get('/health', async (_, reply) => {
      return reply.send({
        status: 'ok',
        service: 'ai-tasks-service'
      });
    });

    // 获取所有AI对话
    aiTasksInstance.get('/', async (_, reply) => {
      // 模拟实现：返回空数组
      return reply.send({
        data: [],
        meta: {
          code: 200,
          message: 'Success',
          total: 0,
          page: 1,
          limit: 20
        }
      });
    });

    // 创建AI对话
    aiTasksInstance.post('/', async (request, reply) => {
      // 模拟实现：返回创建的对话
      const body = request.body as any;
      return reply.send({
        data: {
          id: Date.now().toString(),
          name: body.name || '新对话',
          description: body.description || '',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1'
        },
        meta: {
          code: 201,
          message: 'Success'
        }
      });
    });

    // 获取单个AI对话
    aiTasksInstance.get('/:id', async (request, reply) => {
      // 模拟实现：返回单个对话
      const params = request.params as any;
      return reply.send({
        data: {
          id: params.id,
          name: '示例对话',
          description: '这是一个示例对话',
          messages: [
            {
              id: 'msg-1',
              content: '你好，有什么可以帮助你的？',
              role: 'assistant',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1'
        },
        meta: {
          code: 200,
          message: 'Success'
        }
      });
    });

    // 发送消息到AI对话
    aiTasksInstance.post('/:id/messages', async (request, reply) => {
      // 模拟实现：返回AI回复
      const params = request.params as any;
      const body = request.body as any;
      return reply.send({
        data: {
          id: 'msg-' + Date.now(),
          content: `收到你的消息：${body.message}。这是一个模拟回复。`,
          role: 'assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        meta: {
          code: 201,
          message: 'Success'
        }
      });
    });

    // 删除AI对话
    aiTasksInstance.delete('/:id', async (request, reply) => {
      // 模拟实现：返回成功
      return reply.send({
        data: null,
        meta: {
          code: 204,
          message: 'Success'
        }
      });
    });

    done();
  }, { prefix: '/ai-tasks' });
}