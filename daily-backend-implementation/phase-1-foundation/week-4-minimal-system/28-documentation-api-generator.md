# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 代码实现

## API 文档生成器

```typescript
// src/documentation/ApiDocumentationGenerator.ts

import { ExpressApp } from '../application/ExpressApp';
import { SystemComponents } from '../infrastructure/system/SystemIntegrator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * API 文档生成器配置
 */
export interface ApiDocumentationGeneratorConfig {
  outputPath: string;
  title: string;
  version: string;
  description: string;
}

/**
 * API 文档生成器
 */
export class ApiDocumentationGenerator {
  private readonly config: ApiDocumentationGeneratorConfig;
  private readonly components: SystemComponents;

  /**
   * 创建 API 文档生成器
   * @param components 系统组件
   * @param config 生成器配置
   */
  constructor(components: SystemComponents, config: ApiDocumentationGeneratorConfig) {
    this.components = components;
    this.config = {
      outputPath: './docs/api',
      title: 'AI 认知辅助系统 API',
      version: '1.0.0',
      description: 'AI 认知辅助系统的 RESTful API 文档',
      ...config,
    };
  }

  /**
   * 生成 API 文档
   */
  public generate(): void {
    try {
      // 创建输出目录
      mkdirSync(this.config.outputPath, { recursive: true });

      // 生成 OpenAPI 规范
      const openApiSpec = this.generateOpenApiSpec();
      const openApiPath = join(this.config.outputPath, 'openapi.json');
      writeFileSync(openApiPath, JSON.stringify(openApiSpec, null, 2));

      // 生成 Markdown 文档
      const markdownDocs = this.generateMarkdownDocs(openApiSpec);
      const markdownPath = join(this.config.outputPath, 'api.md');
      writeFileSync(markdownPath, markdownDocs);

      this.components.loggingSystem.logInfo('API documentation generated successfully', {
        outputPath: this.config.outputPath,
        files: ['openapi.json', 'api.md'],
      });
    } catch (error: any) {
      this.components.loggingSystem.logError('Failed to generate API documentation', error);
      throw error;
    }
  }

  /**
   * 生成 OpenAPI 规范
   */
  private generateOpenApiSpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description,
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: '开发环境',
        },
        {
          url: 'http://localhost:8080',
          description: '测试环境',
        },
        {
          url: 'https://api.example.com',
          description: '生产环境',
        },
      ],
      paths: {
        '/api/health': {
          get: {
            summary: '系统健康检查',
            description: '检查系统各组件的健康状态',
            responses: {
              '200': {
                description: '系统健康',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          example: 'ok',
                        },
                        service: {
                          type: 'string',
                          example: 'ai-cognitive-assistant',
                        },
                        timestamp: {
                          type: 'string',
                          format: 'date-time',
                        },
                      },
                    },
                  },
                },
              },
              '503': {
                description: '系统不健康',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          example: 'error',
                        },
                        service: {
                          type: 'string',
                          example: 'ai-cognitive-assistant',
                        },
                        timestamp: {
                          type: 'string',
                          format: 'date-time',
                        },
                        error: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/thoughts': {
          get: {
            summary: '获取思维片段列表',
            description: '获取所有思维片段的列表，支持分页',
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: '页码',
                schema: {
                  type: 'integer',
                  default: 1,
                },
              },
              {
                name: 'limit',
                in: 'query',
                description: '每页数量',
                schema: {
                  type: 'integer',
                  default: 10,
                  maximum: 100,
                },
              },
            ],
            responses: {
              '200': {
                description: '思维片段列表',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'object',
                          properties: {
                            thoughts: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: {
                                    type: 'string',
                                    example: '1',
                                  },
                                  content: {
                                    type: 'string',
                                    example: '这是一个思维片段',
                                  },
                                  tags: {
                                    type: 'array',
                                    items: {
                                      type: 'string',
                                    },
                                    example: ['标签1', '标签2'],
                                  },
                                  createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                  },
                                  updatedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                  },
                                },
                              },
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: {
                                  type: 'integer',
                                  example: 1,
                                },
                                limit: {
                                  type: 'integer',
                                  example: 10,
                                },
                                total: {
                                  type: 'integer',
                                  example: 100,
                                },
                                totalPages: {
                                  type: 'integer',
                                  example: 10,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: '创建思维片段',
            description: '创建一个新的思维片段',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      content: {
                        type: 'string',
                        example: '这是一个新的思维片段',
                        description: '思维片段的内容',
                      },
                      tags: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        example: ['标签1', '标签2'],
                        description: '思维片段的标签',
                      },
                    },
                    required: ['content'],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: '思维片段创建成功',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: '1',
                            },
                            content: {
                              type: 'string',
                              example: '这是一个新的思维片段',
                            },
                            tags: {
                              type: 'array',
                              items: {
                                type: 'string',
                              },
                              example: ['标签1', '标签2'],
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/thoughts/{id}': {
          get: {
            summary: '获取思维片段详情',
            description: '根据ID获取思维片段的详细信息',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: '思维片段ID',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: '思维片段详情',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: '1',
                            },
                            content: {
                              type: 'string',
                              example: '这是一个思维片段',
                            },
                            tags: {
                              type: 'array',
                              items: {
                                type: 'string',
                              },
                              example: ['标签1', '标签2'],
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: '思维片段不存在',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          put: {
            summary: '更新思维片段',
            description: '根据ID更新思维片段的信息',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: '思维片段ID',
                schema: {
                  type: 'string',
                },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      content: {
                        type: 'string',
                        example: '更新后的思维片段内容',
                        description: '思维片段的内容',
                      },
                      tags: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        example: ['更新的标签1', '更新的标签2'],
                        description: '思维片段的标签',
                      },
                    },
                    required: ['content'],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: '思维片段更新成功',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: '1',
                            },
                            content: {
                              type: 'string',
                              example: '更新后的思维片段内容',
                            },
                            tags: {
                              type: 'array',
                              items: {
                                type: 'string',
                              },
                              example: ['更新的标签1', '更新的标签2'],
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: '请求参数错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: '思维片段不存在',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          delete: {
            summary: '删除思维片段',
            description: '根据ID删除思维片段',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: '思维片段ID',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: '思维片段删除成功',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                              example: '思维片段删除成功',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: '思维片段不存在',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/insights/themes': {
          get: {
            summary: '获取核心主题',
            description: '获取用户认知模型中的核心主题',
            responses: {
              '200': {
                description: '核心主题列表',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true,
                        },
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              theme: {
                                type: 'string',
                                example: '人工智能',
                              },
                              weight: {
                                type: 'number',
                                example: 0.85,
                              },
                              concepts: {
                                type: 'array',
                                items: {
                                  type: 'string',
                                },
                                example: ['机器学习', '深度学习', '神经网络'],
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: '服务器错误',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: false,
                        },
                        error: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                            },
                            code: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          // 共享的模式定义
        },
        securitySchemes: {
          // 安全方案定义
        },
      },
    };
  }

  /**
   * 生成 Markdown 文档
   * @param openApiSpec OpenAPI 规范
   */
  private generateMarkdownDocs(openApiSpec: any): string {
    let markdown = `# ${openApiSpec.info.title} v${openApiSpec.info.version}\n\n`;
    markdown += `${openApiSpec.info.description}\n\n`;
    markdown += `## 目录\n\n`;

    // 生成目录
    Object.keys(openApiSpec.paths).forEach(path => {
      const pathItem = openApiSpec.paths[path];
      Object.keys(pathItem).forEach(method => {
        const operation = pathItem[method];
        const title = `${method.toUpperCase()} ${path}`;
        const anchor = `${method}-${path.replace(/\//g, '-').replace(/\{/g, '').replace(/\}/g, '')}`;
        markdown += `- [${title}](#${anchor})\n`;
      });
    });

    markdown += `\n`;

    // 生成每个 API 的详细文档
    Object.keys(openApiSpec.paths).forEach(path => {
      const pathItem = openApiSpec.paths[path];
      Object.keys(pathItem).forEach(method => {
        const operation = pathItem[method];
        const title = `${method.toUpperCase()} ${path}`;
        const anchor = `${method}-${path.replace(/\//g, '-').replace(/\{/g, '').replace(/\}/g, '')}`;

        markdown += `## ${title} {#${anchor}}\n\n`;
        markdown += `${operation.description || operation.summary}\n\n`;

        // 参数
        if (operation.parameters && operation.parameters.length > 0) {
          markdown += `### 参数\n\n`;
          markdown += `| 名称 | 位置 | 类型 | 必需 | 描述 |\n`;
          markdown += `|------|------|------|------|------|\n`;
          operation.parameters.forEach((param: any) => {
            const required = param.required ? '是' : '否';
            const type = param.schema.type;
            const example = param.schema.example ? ` (示例: ${param.schema.example})` : '';
            markdown += `| ${param.name} | ${param.in} | ${type} | ${required} | ${param.description || ''}${example} |\n`;
          });
          markdown += `\n`;
        }

        // 请求体
        if (operation.requestBody) {
          markdown += `### 请求体\n\n`;
          const mediaType = Object.keys(operation.requestBody.content)[0];
          const schema = operation.requestBody.content[mediaType].schema;
          markdown += `\`\`\`json\n`;
          markdown += JSON.stringify(this.generateExampleFromSchema(schema), null, 2);
          markdown += `\n\`\`\`\n\n`;
        }

        // 响应
        markdown += `### 响应\n\n`;
        Object.keys(operation.responses).forEach(statusCode => {
          const response = operation.responses[statusCode];
          markdown += `#### ${statusCode} ${response.description}\n\n`;
          if (response.content) {
            const mediaType = Object.keys(response.content)[0];
            const schema = response.content[mediaType].schema;
            markdown += `\`\`\`json\n`;
            markdown += JSON.stringify(this.generateExampleFromSchema(schema), null, 2);
            markdown += `\n\`\`\`\n\n`;
          }
        });
      });
    });

    return markdown;
  }

  /**
   * 从模式生成示例数据
   * @param schema 模式定义
   */
  private generateExampleFromSchema(schema: any): any {
    if (schema.example) {
      return schema.example;
    }

    if (schema.type === 'object') {
      const example: any = {};
      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          example[key] = this.generateExampleFromSchema(schema.properties[key]);
        });
      }
      return example;
    }

    if (schema.type === 'array') {
      const example: any[] = [];
      example.push(this.generateExampleFromSchema(schema.items));
      return example;
    }

    if (schema.type === 'string') {
      if (schema.format === 'date-time') {
        return new Date().toISOString();
      }
      return 'string value';
    }

    if (schema.type === 'number') {
      return 123;
    }

    if (schema.type === 'integer') {
      return 123;
    }

    if (schema.type === 'boolean') {
      return true;
    }

    return null;
  }
}
```