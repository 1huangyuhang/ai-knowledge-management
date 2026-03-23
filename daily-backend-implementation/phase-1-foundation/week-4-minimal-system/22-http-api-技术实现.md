# Day 22: 第一阶段 - 系统地基期 - Week 4 - 第22天 代码实现

## HTTP API 实现

### 1. 请求验证中间件

```typescript
// src/application/middleware/validation-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * 创建请求验证中间件
 * @param schema Zod验证模式
 * @returns 验证中间件
 */
export const createValidationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证请求体、查询参数和路径参数
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // 将验证后的数据附加到请求对象
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;
      
      next();
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: '请求验证失败',
            code: 'VALIDATION_ERROR',
            type: 'validationError',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

/**
 * 简单的请求日志中间件
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 记录请求开始
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};
```

### 2. ThoughtController 实现

```typescript
// src/application/controllers/ThoughtController.ts
import { Router, Request, Response } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';
import { IngestThoughtUseCase } from '../usecases/IngestThoughtUseCase';
import { GenerateProposalUseCase } from '../usecases/GenerateProposalUseCase';
import { ThoughtRepositoryImpl } from '../../infrastructure/repositories/ThoughtRepositoryImpl';
import { z } from 'zod';
import { createValidationMiddleware } from '../middleware/validation-middleware';

// 思维片段创建请求模式
const createThoughtSchema = z.object({
  body: z.object({
    content: z.string().min(1, '内容不能为空').max(10000, '内容不能超过10000个字符'),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// 思维片段查询请求模式
const getThoughtsSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).optional(),
    offset: z.string().transform(Number).optional(),
    tag: z.string().optional(),
  }),
});

// 思维片段ID请求模式
const thoughtIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * 思维片段控制器
 */
export class ThoughtController {
  private router: Router;
  private ingestThoughtUseCase: IngestThoughtUseCase;
  private generateProposalUseCase: GenerateProposalUseCase;
  private components: SystemComponents;

  /**
   * 创建思维片段控制器
   * @param components 系统组件
   */
  constructor(components: SystemComponents) {
    this.router = Router();
    this.components = components;
    
    // 初始化用例
    const thoughtRepository = new ThoughtRepositoryImpl(
      this.components.databaseClient,
      this.components.eventSystem
    );
    
    this.ingestThoughtUseCase = new IngestThoughtUseCase(thoughtRepository);
    this.generateProposalUseCase = new GenerateProposalUseCase(thoughtRepository);
    
    this.initializeRoutes();
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 创建思维片段
    this.router.post(
      '/',
      createValidationMiddleware(createThoughtSchema),
      this.createThought.bind(this)
    );
    
    // 获取思维片段列表
    this.router.get(
      '/',
      createValidationMiddleware(getThoughtsSchema),
      this.getThoughts.bind(this)
    );
    
    // 获取单个思维片段
    this.router.get(
      '/:id',
      createValidationMiddleware(thoughtIdSchema),
      this.getThought.bind(this)
    );
    
    // 更新思维片段
    this.router.put(
      '/:id',
      createValidationMiddleware(thoughtIdSchema.merge(createThoughtSchema)),
      this.updateThought.bind(this)
    );
    
    // 删除思维片段
    this.router.delete(
      '/:id',
      createValidationMiddleware(thoughtIdSchema),
      this.deleteThought.bind(this)
    );
    
    // 生成认知建议
    this.router.post(
      '/:id/proposal',
      createValidationMiddleware(thoughtIdSchema),
      this.generateProposal.bind(this)
    );
  }

  /**
   * 创建思维片段
   */
  private async createThought(req: Request, res: Response): Promise<void> {
    try {
      const { content, tags, metadata } = req.body;
      
      const result = await this.ingestThoughtUseCase.execute({
        content,
        tags: tags || [],
        metadata: metadata || {},
      });
      
      res.status(201).json({
        data: result,
        meta: {
          message: '思维片段创建成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: error.message,
            code: 'THOUGHT_CREATION_FAILED',
            type: 'businessError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取思维片段列表
   */
  private async getThoughts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0, tag } = req.query as any;
      
      // 这里应该调用查询用例，暂时使用模拟数据
      const thoughts = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: '测试思维片段',
          tags: ['测试'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      res.status(200).json({
        data: {
          thoughts,
          pagination: {
            limit,
            offset,
            total: thoughts.length,
          },
        },
        meta: {
          message: '获取思维片段列表成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        meta: {
          error: {
            message: '获取思维片段列表失败',
            code: 'THOUGHTS_FETCH_FAILED',
            type: 'systemError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取单个思维片段
   */
  private async getThought(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 这里应该调用查询用例，暂时使用模拟数据
      const thought = {
        id,
        content: '测试思维片段',
        tags: ['测试'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      res.status(200).json({
        data: thought,
        meta: {
          message: '获取思维片段成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(404).json({
        data: null,
        meta: {
          error: {
            message: '思维片段不存在',
            code: 'THOUGHT_NOT_FOUND',
            type: 'notFound',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 更新思维片段
   */
  private async updateThought(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, tags, metadata } = req.body;
      
      // 这里应该调用更新用例，暂时使用模拟数据
      const updatedThought = {
        id,
        content,
        tags,
        metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      res.status(200).json({
        data: updatedThought,
        meta: {
          message: '思维片段更新成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: error.message,
            code: 'THOUGHT_UPDATE_FAILED',
            type: 'businessError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 删除思维片段
   */
  private async deleteThought(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 这里应该调用删除用例
      
      res.status(200).json({
        data: null,
        meta: {
          message: '思维片段删除成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: error.message,
            code: 'THOUGHT_DELETE_FAILED',
            type: 'businessError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 生成认知建议
   */
  private async generateProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 这里应该调用生成建议用例，暂时使用模拟数据
      const proposal = {
        id: 'proposal-123',
        thoughtId: id,
        concepts: [
          {
            name: '测试概念',
            description: '这是一个测试概念',
            confidence: 0.9,
          },
        ],
        relations: [],
        createdAt: new Date().toISOString(),
      };
      
      res.status(200).json({
        data: proposal,
        meta: {
          message: '认知建议生成成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: error.message,
            code: 'PROPOSAL_GENERATION_FAILED',
            type: 'businessError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取路由
   */
  public getRoutes(): Router {
    return this.router;
  }
}
```

### 3. InsightController 实现

```typescript
// src/application/controllers/InsightController.ts
import { Router, Request, Response } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';
import { z } from 'zod';
import { createValidationMiddleware } from '../middleware/validation-middleware';

// 认知洞见查询请求模式
const getInsightsSchema = z.object({
  query: z.object({
    type: z.enum(['theme', 'blindspot', 'gap']).optional(),
    limit: z.string().transform(Number).optional(),
    offset: z.string().transform(Number).optional(),
  }),
});

// 认知洞见ID请求模式
const insightIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// 生成洞见请求模式
const generateInsightSchema = z.object({
  body: z.object({
    type: z.enum(['theme', 'blindspot', 'gap']),
    modelId: z.string().uuid(),
  }),
});

/**
 * 认知洞见控制器
 */
export class InsightController {
  private router: Router;
  private components: SystemComponents;

  /**
   * 创建认知洞见控制器
   * @param components 系统组件
   */
  constructor(components: SystemComponents) {
    this.router = Router();
    this.components = components;
    this.initializeRoutes();
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 获取认知洞见列表
    this.router.get(
      '/',
      createValidationMiddleware(getInsightsSchema),
      this.getInsights.bind(this)
    );
    
    // 获取单个认知洞见
    this.router.get(
      '/:id',
      createValidationMiddleware(insightIdSchema),
      this.getInsight.bind(this)
    );
    
    // 生成认知洞见
    this.router.post(
      '/generate',
      createValidationMiddleware(generateInsightSchema),
      this.generateInsight.bind(this)
    );
    
    // 获取主题分析
    this.router.get('/themes', this.getThemes.bind(this));
    
    // 获取盲点分析
    this.router.get('/blindspots', this.getBlindspots.bind(this));
    
    // 获取差距分析
    this.router.get('/gaps', this.getGaps.bind(this));
  }

  /**
   * 获取认知洞见列表
   */
  private async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0, type } = req.query as any;
      
      // 这里应该调用查询用例，暂时使用模拟数据
      const insights = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'theme',
          title: '测试主题',
          description: '这是一个测试主题',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      res.status(200).json({
        data: {
          insights,
          pagination: {
            limit,
            offset,
            total: insights.length,
          },
        },
        meta: {
          message: '获取认知洞见列表成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        meta: {
          error: {
            message: '获取认知洞见列表失败',
            code: 'INSIGHTS_FETCH_FAILED',
            type: 'systemError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取单个认知洞见
   */
  private async getInsight(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 这里应该调用查询用例，暂时使用模拟数据
      const insight = {
        id,
        type: 'theme',
        title: '测试主题',
        description: '这是一个测试主题',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: {
          concepts: ['测试概念'],
          relations: [],
          confidence: 0.9,
        },
      };
      
      res.status(200).json({
        data: insight,
        meta: {
          message: '获取认知洞见成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(404).json({
        data: null,
        meta: {
          error: {
            message: '认知洞见不存在',
            code: 'INSIGHT_NOT_FOUND',
            type: 'notFound',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 生成认知洞见
   */
  private async generateInsight(req: Request, res: Response): Promise<void> {
    try {
      const { type, modelId } = req.body;
      
      // 这里应该调用生成洞见用例，暂时使用模拟数据
      const insight = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type,
        modelId,
        title: `${type} 分析结果`,
        description: `这是一个${type}类型的认知洞见`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      res.status(201).json({
        data: insight,
        meta: {
          message: '认知洞见生成成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        meta: {
          error: {
            message: error.message,
            code: 'INSIGHT_GENERATION_FAILED',
            type: 'businessError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取主题分析
   */
  private async getThemes(req: Request, res: Response): Promise<void> {
    try {
      // 这里应该调用主题分析用例，暂时使用模拟数据
      const themes = [
        {
          id: 'theme-1',
          name: '测试主题',
          description: '这是一个测试主题',
          concepts: ['测试概念1', '测试概念2'],
          confidence: 0.9,
          createdAt: new Date().toISOString(),
        },
      ];
      
      res.status(200).json({
        data: themes,
        meta: {
          message: '获取主题分析成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        meta: {
          error: {
            message: '获取主题分析失败',
            code: 'THEMES_FETCH_FAILED',
            type: 'systemError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取盲点分析
   */
  private async getBlindspots(req: Request, res: Response): Promise<void> {
    try {
      // 这里应该调用盲点分析用例，暂时使用模拟数据
      const blindspots = [
        {
          id: 'blindspot-1',
          name: '测试盲点',
          description: '这是一个测试盲点',
          relatedConcepts: ['测试概念1'],
          confidence: 0.8,
          createdAt: new Date().toISOString(),
        },
      ];
      
      res.status(200).json({
        data: blindspots,
        meta: {
          message: '获取盲点分析成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        meta: {
          error: {
            message: '获取盲点分析失败',
            code: 'BLINDSPOTS_FETCH_FAILED',
            type: 'systemError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取差距分析
   */
  private async getGaps(req: Request, res: Response): Promise<void> {
    try {
      // 这里应该调用差距分析用例，暂时使用模拟数据
      const gaps = [
        {
          id: 'gap-1',
          name: '测试差距',
          description: '这是一个测试差距',
          sourceConcept: '测试概念1',
          targetConcept: '测试概念2',
          confidence: 0.7,
          createdAt: new Date().toISOString(),
        },
      ];
      
      res.status(200).json({
        data: gaps,
        meta: {
          message: '获取差距分析成功',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        meta: {
          error: {
            message: '获取差距分析失败',
            code: 'GAPS_FETCH_FAILED',
            type: 'systemError',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 获取路由
   */
  public getRoutes(): Router {
    return this.router;
  }
}
```

### 4. API 路由配置优化

```typescript
// src/application/routes/index.ts
import { Router } from 'express';
import { SystemComponents } from '../../infrastructure/system/SystemIntegrator';
import { ThoughtController } from '../controllers/ThoughtController';
import { InsightController } from '../controllers/InsightController';
import { HealthController } from '../controllers/HealthController';
import { MetricsController } from '../controllers/MetricsController';

/**
 * 初始化所有API路由
 * @param components 系统组件
 * @returns 主路由
 */
export const initializeRoutes = (components: SystemComponents): Router => {
  const router = Router();
  
  // 初始化控制器
  const thoughtController = new ThoughtController(components);
  const insightController = new InsightController(components);
  const healthController = new HealthController(components);
  const metricsController = new MetricsController(components);
  
  // 注册路由
  router.use('/thoughts', thoughtController.getRoutes());
  router.use('/insights', insightController.getRoutes());
  router.use('/health', healthController.getRoutes());
  router.use('/metrics', metricsController.getRoutes());
  
  // API根路由
  router.get('/', (req, res) => {
    res.json({
      name: 'AI Cognitive Assistant API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        thoughts: '/api/v1/thoughts',
        insights: '/api/v1/insights',
        health: '/api/v1/health',
        metrics: '/api/v1/metrics',
      },
    });
  });
  
  return router;
};
```

### 5. Express应用更新

```typescript
// src/application/ExpressApp.ts (更新)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { SystemComponents } from '../infrastructure/system/SystemIntegrator';
import { createErrorMiddleware } from '../infrastructure/error-handling/error-middleware';
import { initializeRoutes } from './routes';
import { requestLoggerMiddleware } from './middleware/validation-middleware';

/**
 * Express应用配置
 */
export interface ExpressAppConfig {
  components: SystemComponents;
  port?: number;
}

/**
 * Express应用
 */
export class ExpressApp {
  private app: express.Application;
  private port: number;
  private components: SystemComponents;

  /**
   * 创建Express应用
   * @param config Express应用配置
   */
  constructor(config: ExpressAppConfig) {
    this.app = express();
    this.port = config.port || 3000;
    this.components = config.components;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  private initializeMiddleware(): void {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS中间件
    const corsOrigins = this.components.configManager.get<string[]>('CORS_ORIGINS', ['*']);
    this.app.use(cors({
      origin: corsOrigins,
      credentials: true,
    }));
    
    // 压缩中间件
    this.app.use(compression());
    
    // JSON解析中间件
    this.app.use(express.json({
      limit: '1mb',
    }));
    
    // URL编码中间件
    this.app.use(express.urlencoded({
      extended: true,
    }));
    
    // 请求日志中间件
    this.app.use(requestLoggerMiddleware);
    
    // Morgan日志中间件
    const logLevel = this.components.configManager.get<string>('LOG_LEVEL', 'info');
    if (logLevel !== 'error') {
      this.app.use(morgan('combined'));
    }
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 注册API路由，使用/v1版本前缀
    this.app.use('/api/v1', initializeRoutes(this.components));
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling(): void {
    // 404处理
  this.app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404).json({
      data: null,
      meta: {
        error: {
          message: error.message,
          code: 'NOT_FOUND',
          type: 'notFound',
        },
        timestamp: new Date().toISOString(),
      },
    });
  });
    
    // 错误中间件
    const errorMiddleware = createErrorMiddleware(this.components.errorHandler);
    this.app.use(errorMiddleware);
  }

  /**
   * 启动Express应用
   */
  public start(): void {
    this.app.listen(this.port, () => {
      this.components.loggingSystem.logInfo(`Server is running on port ${this.port}`);
      this.components.loggingSystem.logInfo(`Environment: ${this.components.configManager.get<string>('NODE_ENV')}`);
      this.components.loggingSystem.logInfo(`API Documentation: http://localhost:${this.port}/api`);
    });
  }

  /**
   * 获取Express应用实例
   */
  public getApp(): express.Application {
    return this.app;
  }
}
```

### 6. 请求验证器扩展

```typescript
// src/application/validators/request-validators.ts
import { z } from 'zod';

/**
 * 思维片段验证模式
 */
export const thoughtValidators = {
  // 创建思维片段验证模式
  create: z.object({
    content: z.string().min(1, '内容不能为空').max(10000, '内容不能超过10000个字符'),
    tags: z.array(z.string().max(50, '标签不能超过50个字符')).optional(),
    metadata: z.record(z.any()).optional(),
  }),
  
  // 更新思维片段验证模式
  update: z.object({
    content: z.string().min(1, '内容不能为空').max(10000, '内容不能超过10000个字符').optional(),
    tags: z.array(z.string().max(50, '标签不能超过50个字符')).optional(),
    metadata: z.record(z.any()).optional(),
  }),
  
  // 查询思维片段验证模式
  query: z.object({
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
    tag: z.string().max(50, '标签不能超过50个字符').optional(),
  }),
};

/**
 * 认知洞见验证模式
 */
export const insightValidators = {
  // 生成认知洞见验证模式
  generate: z.object({
    type: z.enum(['theme', 'blindspot', 'gap']),
    modelId: z.string().uuid('无效的模型ID'),
  }),
  
  // 查询认知洞见验证模式
  query: z.object({
    type: z.enum(['theme', 'blindspot', 'gap']).optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  }),
};
```

### 7. API文档生成配置

```yaml
# src/config/openapi.config.yml
openapi:
  info:
    title: AI Cognitive Assistant API
    description: AI驱动的认知辅助系统API
    version: 1.0.0
    contact:
      name: Developer
      email: developer@example.com
  servers:
    - url: http://localhost:3000/api/v1
      description: 开发服务器
    - url: https://api.example.com/api/v1
      description: 生产服务器
  paths:
    /thoughts:
      post:
        summary: 创建思维片段
        description: 创建新的思维片段
        requestBody:
          required: true
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ThoughtCreate'
        responses:
          '201':
            description: 思维片段创建成功
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Thought'
          '400':
            description: 请求验证失败
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/ErrorResponse'
  components:
    schemas:
      # 统一响应格式
      ApiResponse:
        type: object
        properties:
          data:
            oneOf:
              - type: object
              - type: array
              - type: null
            description: 响应数据
          meta:
            type: object
            properties:
              message:
                type: string
                description: 响应消息
              timestamp:
                type: string
                format: date-time
                description: 响应时间戳
              error:
                type: object
                properties:
                  message:
                    type: string
                    description: 错误消息
                  code:
                    type: string
                    description: 错误代码
                  type:
                    type: string
                    description: 错误类型
                  details:
                    type: array
                    items:
                      type: object
                    description: 错误详情
        required:
          - data
          - meta

      # 思维片段相关模型
      ThoughtCreate:
        type: object
        required:
          - content
        properties:
          content:
            type: string
            description: 思维片段内容
            maxLength: 10000
          tags:
            type: array
            items:
              type: string
              maxLength: 50
            description: 思维片段标签
          metadata:
            type: object
            description: 思维片段元数据
      Thought:
        type: object
        properties:
          id:
            type: string
            format: uuid
            description: 思维片段ID
          content:
            type: string
            description: 思维片段内容
          tags:
            type: array
            items:
              type: string
            description: 思维片段标签
          createdAt:
            type: string
            format: date-time
            description: 创建时间
          updatedAt:
            type: string
            format: date-time
            description: 更新时间
```
