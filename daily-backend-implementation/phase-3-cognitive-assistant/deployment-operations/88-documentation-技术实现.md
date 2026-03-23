# 88-文档管理技术实现文档

## 1. 架构设计

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  DocumentApiController│ │ DocumentationController│ │ ApiDocController│ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Application Layer                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  DocumentService    │  │  DocumentVersionService│ │ ApiDocService   │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Domain Layer                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  Document           │  │  DocumentVersion    │  │  DocumentType     │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Infrastructure Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  FileDocumentStorage│ │ S3DocumentStorage   │ │ SwaggerGenerator  │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                │  │  │
                                ▼  ▼  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI Capability Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  DocumentGenerator  │ │ DocumentOptimizer    │ │ DocSummarizer     │ │
│  └─────────────────────┘  └─────────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 职责 | 分层 |
|------|------|------|
| DocumentService | 文档管理核心服务 | Application |
| DocumentVersionService | 文档版本管理服务 | Application |
| ApiDocService | API文档管理服务 | Application |
| DocumentRepository | 文档存储接口 | Domain |
| FileDocumentStorage | 文件系统文档存储实现 | Infrastructure |
| S3DocumentStorage | S3云存储文档实现 | Infrastructure |
| SwaggerGenerator | Swagger文档生成器 | Infrastructure |
| DocumentGenerator | 文档生成服务 | AI Capability |
| DocumentOptimizer | 文档优化服务 | AI Capability |
| DocSummarizer | 文档摘要服务 | AI Capability |

## 2. 领域模型设计

### 2.1 核心实体

```typescript
// src/domain/entities/Document.ts
export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  content: string;
  format: DocumentFormat;
  metadata: Record<string, any>;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  version: string;
  tags: string[];
  category: string;
  isPublic: boolean;
}

// src/domain/enums/DocumentType.ts
export enum DocumentType {
  API = 'API',
  TECHNICAL = 'TECHNICAL',
  USER = 'USER',
  ARCHITECTURE = 'ARCHITECTURE',
  REQUIREMENTS = 'REQUIREMENTS',
  TEST = 'TEST',
  MAINTAINANCE = 'MAINTAINANCE',
  OTHER = 'OTHER'
}

// src/domain/enums/DocumentStatus.ts
export enum DocumentStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// src/domain/enums/DocumentFormat.ts
export enum DocumentFormat {
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  PDF = 'PDF',
  WORD = 'WORD',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  YAML = 'YAML'
}

// src/domain/entities/DocumentVersion.ts
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  content: string;
  author: string;
  createdAt: Date;
  changeLog: string;
  isCurrent: boolean;
  metadata: Record<string, any>;
}

// src/domain/entities/DocumentType.ts
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/domain/entities/DocumentCategory.ts
export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. Application层设计

### 3.1 服务接口

```typescript
// src/application/services/DocumentService.ts
export interface DocumentService {
  createDocument(document: DocumentCreateDto): Promise<Document>;
  getDocument(id: string): Promise<Document>;
  listDocuments(filter: DocumentFilter, pagination: Pagination): Promise<PaginatedResult<Document>>;
  updateDocument(id: string, document: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  publishDocument(id: string): Promise<Document>;
  archiveDocument(id: string): Promise<Document>;
  searchDocuments(query: string, filter: DocumentFilter, pagination: Pagination): Promise<PaginatedResult<Document>>;
  generateDocumentFromTemplate(templateId: string, data: any): Promise<Document>;
  convertDocument(id: string, format: DocumentFormat): Promise<Document>;
}

// src/application/services/DocumentVersionService.ts
export interface DocumentVersionService {
  createVersion(documentId: string, version: DocumentVersionCreateDto): Promise<DocumentVersion>;
  getVersion(id: string): Promise<DocumentVersion>;
  listVersions(documentId: string, pagination: Pagination): Promise<PaginatedResult<DocumentVersion>>;
  restoreVersion(id: string): Promise<Document>;
  deleteVersion(id: string): Promise<void>;
  compareVersions(versionId1: string, versionId2: string): Promise<VersionComparison>;
}

// src/application/services/ApiDocService.ts
export interface ApiDocService {
  generateApiDocs(): Promise<Document>;
  updateApiDocs(): Promise<Document>;
  getApiDocs(): Promise<Document>;
  exportApiDocs(format: DocumentFormat): Promise<Blob>;
  publishApiDocs(): Promise<Document>;
}
```

### 3.2 服务实现

```typescript
// src/application/services/impl/DocumentServiceImpl.ts
import { DocumentService } from '../DocumentService';
import { DocumentRepository } from '../../domain/repositories/DocumentRepository';
import { Document } from '../../domain/entities/Document';
import { DocumentStatus } from '../../domain/enums/DocumentStatus';
import { DocumentFormat } from '../../domain/enums/DocumentFormat';

export class DocumentServiceImpl implements DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository
  ) {}

  async createDocument(document: DocumentCreateDto): Promise<Document> {
    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: document.title,
      type: document.type,
      status: DocumentStatus.DRAFT,
      content: document.content,
      format: document.format || DocumentFormat.MARKDOWN,
      metadata: document.metadata || {},
      author: document.author || 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: document.author || 'system',
      version: '1.0.0',
      tags: document.tags || [],
      category: document.category || 'uncategorized',
      isPublic: document.isPublic || false
    };

    return this.documentRepository.save(newDocument);
  }

  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    const existingDocument = await this.documentRepository.findById(id);
    if (!existingDocument) {
      throw new Error(`Document with id ${id} not found`);
    }

    const updatedDocument = {
      ...existingDocument,
      ...document,
      updatedAt: new Date(),
      // 自动更新版本号
      version: this.incrementVersion(existingDocument.version)
    };

    return this.documentRepository.update(updatedDocument);
  }

  async publishDocument(id: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error(`Document with id ${id} not found`);
    }

    const updatedDocument = {
      ...document,
      status: DocumentStatus.PUBLISHED,
      updatedAt: new Date()
    };

    return this.documentRepository.update(updatedDocument);
  }

  private incrementVersion(version: string): string {
    // 实现版本号递增逻辑，例如从1.0.0到1.0.1
    const parts = version.split('.').map(Number);
    parts[parts.length - 1]++;
    return parts.join('.');
  }

  // 其他方法实现
}
```

## 4. Infrastructure层设计

### 4.1 文档存储实现

```typescript
// src/infrastructure/repositories/FileDocumentStorage.ts
import { DocumentRepository } from '../../domain/repositories/DocumentRepository';
import { Document } from '../../domain/entities/Document';
import { DocumentVersion } from '../../domain/entities/DocumentVersion';
import { promises as fs } from 'fs';
import { join } from 'path';

export class FileDocumentStorage implements DocumentRepository {
  constructor(private readonly storagePath: string) {
    // 确保存储目录存在
    this.ensureStoragePathExists();
  }

  private async ensureStoragePathExists(): Promise<void> {
    try {
      await fs.access(this.storagePath);
    } catch {
      await fs.mkdir(this.storagePath, { recursive: true });
    }
  }

  async save(document: Document): Promise<Document> {
    // 保存文档元数据到数据库
    // 保存文档内容到文件系统
    const contentPath = join(this.storagePath, `${document.id}.md`);
    await fs.writeFile(contentPath, document.content);
    
    // 保存元数据到数据库（此处简化处理）
    const metadataPath = join(this.storagePath, `${document.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(document));
    
    return document;
  }

  async findById(id: string): Promise<Document | null> {
    try {
      const metadataPath = join(this.storagePath, `${id}.json`);
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);
      
      const contentPath = join(this.storagePath, `${id}.md`);
      const content = await fs.readFile(contentPath, 'utf8');
      
      return {
        ...metadata,
        content,
        createdAt: new Date(metadata.createdAt),
        updatedAt: new Date(metadata.updatedAt)
      };
    } catch {
      return null;
    }
  }

  async update(document: Document): Promise<Document> {
    // 更新文档内容和元数据
    return this.save(document);
  }

  async delete(id: string): Promise<void> {
    // 删除文档文件和元数据
    const contentPath = join(this.storagePath, `${id}.md`);
    const metadataPath = join(this.storagePath, `${id}.json`);
    
    try {
      await fs.unlink(contentPath);
      await fs.unlink(metadataPath);
    } catch {
      // 文件不存在，忽略错误
    }
  }

  // 其他方法实现
}
```

### 4.2 Swagger文档生成器

```typescript
// src/infrastructure/services/SwaggerGenerator.ts
import { OpenAPIV3 } from 'openapi-types';
import swaggerJSDoc from 'swagger-jsdoc';
import { Document } from '../../domain/entities/Document';
import { DocumentFormat } from '../../domain/enums/DocumentFormat';

export class SwaggerGenerator {
  private swaggerOptions: swaggerJSDoc.Options;
  
  constructor(swaggerOptions: swaggerJSDoc.Options) {
    this.swaggerOptions = swaggerOptions;
  }

  async generateApiDocs(): Promise<OpenAPIV3.Document> {
    // 生成Swagger文档
    return swaggerJSDoc(this.swaggerOptions);
  }

  async convertToMarkdown(swaggerDoc: OpenAPIV3.Document): Promise<string> {
    // 将Swagger文档转换为Markdown格式
    let markdown = `# API Documentation\n\n`;
    
    markdown += `## Overview\n\n`;
    markdown += `${swaggerDoc.info.description || ''}\n\n`;
    
    markdown += `## Base URL\n\n`;
    markdown += `${swaggerDoc.servers?.[0]?.url || ''}\n\n`;
    
    markdown += `## Endpoints\n\n`;
    
    // 遍历所有路径和方法
    if (swaggerDoc.paths) {
      for (const [path, pathItem] of Object.entries(swaggerDoc.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (typeof operation === 'object' && 'operationId' in operation) {
            markdown += `### ${method.toUpperCase()} ${path}\n\n`;
            markdown += `${operation.summary || ''}\n\n`;
            markdown += `${operation.description || ''}\n\n`;
            
            // 参数
            if (operation.parameters) {
              markdown += `#### Parameters\n\n`;
              markdown += `| Name | In | Required | Type | Description |\n`;
              markdown += `|------|----|----------|------|-------------|\n`;
              for (const param of operation.parameters) {
                if ('name' in param) {
                  markdown += `| ${param.name} | ${param.in} | ${param.required ? 'Yes' : 'No'} | ${param.schema?.type || ''} | ${param.description || ''} |\n`;
                }
              }
              markdown += `\n`;
            }
            
            // 请求体
            if (operation.requestBody) {
              markdown += `#### Request Body\n\n`;
              markdown += `${operation.requestBody.description || ''}\n\n`;
            }
            
            // 响应
            if (operation.responses) {
              markdown += `#### Responses\n\n`;
              for (const [status, response] of Object.entries(operation.responses)) {
                if (typeof response === 'object') {
                  markdown += `##### ${status}\n\n`;
                  markdown += `${response.description || ''}\n\n`;
                }
              }
            }
            
            markdown += `---\n\n`;
          }
        }
      }
    }
    
    return markdown;
  }
}
```

## 5. Presentation层设计

### 5.1 API控制器

```typescript
// src/presentation/controllers/DocumentApiController.ts
import { Request, Response } from 'express';
import { DocumentService } from '../../application/services/DocumentService';
import { Controller, Post, Get, Put, Delete, UseMiddleware } from '../decorators/Controller';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { DocumentType } from '../../domain/enums/DocumentType';
import { DocumentFormat } from '../../domain/enums/DocumentFormat';

@Controller('/api/documents')
export class DocumentApiController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('/')
  @UseMiddleware(AuthMiddleware)
  async createDocument(req: Request, res: Response): Promise<void> {
    const document = await this.documentService.createDocument(req.body);
    res.status(201).json(document);
  }

  @Get('/:id')
  @UseMiddleware(AuthMiddleware)
  async getDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const document = await this.documentService.getDocument(id);
    if (!document) {
      res.status(404).json({ message: `Document with id ${id} not found` });
      return;
    }
    res.status(200).json(document);
  }

  @Get('/')
  @UseMiddleware(AuthMiddleware)
  async listDocuments(req: Request, res: Response): Promise<void> {
    const { type, status, category, isPublic, page = 1, limit = 10 } = req.query;
    const filter = {
      type: type as DocumentType,
      status: status as DocumentStatus,
      category: category as string,
      isPublic: isPublic === 'true'
    };
    const pagination = { page: parseInt(page as string), limit: parseInt(limit as string) };
    const result = await this.documentService.listDocuments(filter, pagination);
    res.status(200).json(result);
  }

  @Put('/:id')
  @UseMiddleware(AuthMiddleware)
  async updateDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const document = await this.documentService.updateDocument(id, req.body);
    res.status(200).json(document);
  }

  @Delete('/:id')
  @UseMiddleware(AuthMiddleware)
  async deleteDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.documentService.deleteDocument(id);
    res.status(204).send();
  }

  @Post('/:id/publish')
  @UseMiddleware(AuthMiddleware)
  async publishDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const document = await this.documentService.publishDocument(id);
    res.status(200).json(document);
  }

  @Post('/:id/archive')
  @UseMiddleware(AuthMiddleware)
  async archiveDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const document = await this.documentService.archiveDocument(id);
    res.status(200).json(document);
  }

  @Get('/search')
  @UseMiddleware(AuthMiddleware)
  async searchDocuments(req: Request, res: Response): Promise<void> {
    const { query, type, status, category, isPublic, page = 1, limit = 10 } = req.query;
    const filter = {
      type: type as DocumentType,
      status: status as DocumentStatus,
      category: category as string,
      isPublic: isPublic === 'true'
    };
    const pagination = { page: parseInt(page as string), limit: parseInt(limit as string) };
    const result = await this.documentService.searchDocuments(query as string, filter, pagination);
    res.status(200).json(result);
  }

  // 其他API端点实现
}
```

## 6. AI Capability层设计

### 6.1 文档生成服务

```typescript
// src/ai/services/DocumentGenerator.ts
import { AIService } from './AIService';

export class DocumentGenerator {
  constructor(private readonly aiService: AIService) {}

  async generateDocument(prompt: string, type: DocumentType): Promise<GeneratedDocument> {
    // 使用AI服务生成文档
    const result = await this.aiService.generateDocument({
      prompt,
      type,
      format: 'markdown'
    });

    return {
      title: result.title,
      content: result.content,
      type,
      format: DocumentFormat.MARKDOWN,
      suggestedTags: result.tags
    };
  }

  async generateApiDocumentation(apiSpec: any): Promise<GeneratedDocument> {
    // 使用AI服务从API规范生成文档
    const result = await this.aiService.generateApiDocumentation({
      apiSpec,
      format: 'markdown'
    });

    return {
      title: result.title,
      content: result.content,
      type: DocumentType.API,
      format: DocumentFormat.MARKDOWN,
      suggestedTags: result.tags
    };
  }
}
```

### 6.2 文档优化服务

```typescript
// src/ai/services/DocumentOptimizer.ts
import { AIService } from './AIService';

export class DocumentOptimizer {
  constructor(private readonly aiService: AIService) {}

  async optimizeDocument(content: string, type: DocumentType): Promise<OptimizedDocument> {
    // 使用AI服务优化文档
    const result = await this.aiService.optimizeDocument({
      content,
      type,
      format: 'markdown'
    });

    return {
      optimizedContent: result.content,
      suggestions: result.suggestions,
      improvedReadability: result.readabilityScore,
      estimatedTimeSaving: result.estimatedTimeSaving
    };
  }

  async summarizeDocument(content: string, maxLength: number = 500): Promise<DocumentSummary> {
    // 使用AI服务生成文档摘要
    const result = await this.aiService.summarizeDocument({
      content,
      maxLength
    });

    return {
      summary: result.summary,
      keyPoints: result.keyPoints,
      wordCount: result.wordCount,
      readingTime: result.readingTime
    };
  }
}
```

## 7. API设计

### 7.1 文档管理API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/documents` | POST | 管理员 | 创建文档 | `DocumentCreateDto` | `201 Created` with document |
| `/api/documents/:id` | GET | 是 | 获取文档详情 | N/A | `200 OK` with document |
| `/api/documents` | GET | 是 | 列出文档 | 查询参数：`type`, `status`, `category`, `isPublic`, `page`, `limit` | `200 OK` with paginated documents |
| `/api/documents/:id` | PUT | 管理员 | 更新文档 | `Partial<Document>` | `200 OK` with updated document |
| `/api/documents/:id` | DELETE | 管理员 | 删除文档 | N/A | `204 No Content` |
| `/api/documents/:id/publish` | POST | 管理员 | 发布文档 | N/A | `200 OK` with published document |
| `/api/documents/:id/archive` | POST | 管理员 | 归档文档 | N/A | `200 OK` with archived document |
| `/api/documents/search` | GET | 是 | 搜索文档 | 查询参数：`query`, `type`, `status`, `category`, `isPublic`, `page`, `limit` | `200 OK` with paginated documents |
| `/api/documents/convert/:id` | POST | 管理员 | 转换文档格式 | `{ format: string }` | `200 OK` with converted document |

### 7.2 文档版本API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/documents/:id/versions` | POST | 管理员 | 创建文档版本 | `DocumentVersionCreateDto` | `201 Created` with version |
| `/api/documents/:id/versions` | GET | 是 | 列出文档版本 | 查询参数：`page`, `limit` | `200 OK` with paginated versions |
| `/api/documents/versions/:versionId` | GET | 是 | 获取版本详情 | N/A | `200 OK` with version |
| `/api/documents/versions/:versionId/restore` | POST | 管理员 | 恢复文档版本 | N/A | `200 OK` with restored document |
| `/api/documents/versions/:versionId` | DELETE | 管理员 | 删除文档版本 | N/A | `204 No Content` |
| `/api/documents/versions/compare` | POST | 管理员 | 比较两个版本 | `{ versionId1: string, versionId2: string }` | `200 OK` with comparison result |

### 7.3 API文档API

| 端点 | 方法 | 认证 | 描述 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| `/api/api-docs` | GET | 是 | 获取API文档 | N/A | `200 OK` with API document |
| `/api/api-docs/generate` | POST | 管理员 | 生成API文档 | N/A | `200 OK` with generated API document |
| `/api/api-docs/update` | PUT | 管理员 | 更新API文档 | N/A | `200 OK` with updated API document |
| `/api/api-docs/export` | GET | 管理员 | 导出API文档 | 查询参数：`format` | `200 OK` with file download |
| `/api/api-docs/publish` | POST | 管理员 | 发布API文档 | N/A | `200 OK` with published API document |

## 8. 数据库设计

### 8.1 文档相关表结构

```sql
-- 文档表
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    format VARCHAR(20) NOT NULL,
    metadata JSONB,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE
);

-- 文档标签表
CREATE TABLE document_tags (
    document_id VARCHAR(36) REFERENCES documents(id),
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (document_id, tag)
);

-- 文档版本表
CREATE TABLE document_versions (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) REFERENCES documents(id),
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_log TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    metadata JSONB
);

-- 文档类型表
CREATE TABLE document_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档分类表
CREATE TABLE document_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id VARCHAR(36) REFERENCES document_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_documents_type_status ON documents(type, status);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_is_current ON document_versions(is_current);
CREATE INDEX idx_document_tags_tag ON document_tags(tag);
```

## 9. 部署与集成

### 9.1 Docker配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 应用服务
  app:
    # ...
    environment:
      # 文档配置
      DOCUMENT_STORAGE_TYPE: "file" # 可选: file, s3
      DOCUMENT_STORAGE_PATH: "/app/documents"
      # S3配置（当DOCUMENT_STORAGE_TYPE为s3时需要）
      S3_BUCKET_NAME: "cognitive-assistant-documents"
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      AWS_REGION: "us-east-1"
    volumes:
      - document-storage:/app/documents

  # 文档服务（可选，用于独立运行文档生成和管理）
  document-service:
    build: ./document-service
    depends_on:
      - app
    environment:
      # 文档配置
      APP_API_URL: "http://app:3000/api"
      # 其他环境变量
    volumes:
      - document-storage:/app/documents

volumes:
  document-storage:
```

### 9.2 文档生成脚本

```bash
#!/bin/bash
# generate-docs.sh

# 设置环境变量
set -e

echo "Generating documentation at $(date)"

# 生成API文档
echo "Generating API documentation..."
curl -s -X POST http://localhost:3000/api/api-docs/generate

# 生成技术文档
echo "Generating technical documentation..."
curl -s -X POST http://localhost:3000/api/documents/generate -H "Content-Type: application/json" -d '{"type": "TECHNICAL", "prompt": "Generate technical documentation for the cognitive assistant system"}'

# 生成用户文档
echo "Generating user documentation..."
curl -s -X POST http://localhost:3000/api/documents/generate -H "Content-Type: application/json" -d '{"type": "USER", "prompt": "Generate user documentation for the cognitive assistant system"}'

echo "Documentation generation completed at $(date)"
```

## 10. 性能优化

### 10.1 文档存储优化

1. **分层存储**：将频繁访问的文档存储在快速存储介质（如SSD），不常用的文档存储在低成本存储介质
2. **文档压缩**：对大型文档进行压缩存储，减少存储空间和传输时间
3. **缓存机制**：对频繁访问的文档进行缓存，提高访问速度
4. **异步处理**：对文档生成、转换等耗时操作采用异步处理，提高系统响应速度
5. **批量操作**：对批量文档操作进行优化，减少数据库交互次数

### 10.2 文档检索优化

1. **全文搜索**：实现高效的全文搜索功能，支持关键词高亮和模糊匹配
2. **索引优化**：对文档标题、标签、分类等字段建立索引，提高查询效率
3. **分页查询**：实现高效的分页查询，避免一次性加载大量文档
4. **搜索缓存**：对频繁执行的搜索结果进行缓存，提高搜索速度
5. **搜索建议**：实现搜索建议功能，提高用户搜索体验

### 10.3 文档生成优化

1. **模板复用**：对常用文档类型创建模板，提高文档生成效率
2. **增量生成**：对已有文档的更新采用增量生成方式，减少生成时间
3. **并行生成**：对多个文档生成任务进行并行处理，提高生成效率
4. **生成队列**：对文档生成任务进行队列管理，避免系统过载
5. **生成监控**：对文档生成过程进行监控，及时发现和处理问题

## 11. 监控与告警

### 11.1 文档系统监控指标

| 指标 | 描述 | 告警阈值 |
|------|------|----------|
| 文档访问次数 | 文档访问的总次数 | > 1000次/分钟 |
| 文档生成时间 | 文档生成的平均时间 | > 30秒 |
| 文档存储使用率 | 文档存储的占用率 | > 80% |
| 文档搜索响应时间 | 文档搜索的平均响应时间 | > 500ms |
| 文档转换成功率 | 文档转换的成功率 | < 95% |
| 文档版本数量 | 单文档的版本数量 | > 50 |

### 11.2 告警规则

```yaml
# prometheus-alert-rules.yml
groups:
- name: documentation-alerts
  rules:
  - alert: HighDocumentAccessRate
    expr: sum(rate(document_access_total[5m])) by (document_id) > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High document access rate for {{ $labels.document_id }}"
      description: "Document {{ $labels.document_id }} is being accessed at {{ $value }} times per minute"

  - alert: HighDocumentGenerationTime
    expr: histogram_quantile(0.95, sum(rate(document_generation_duration_seconds_bucket[5m])) by (le)) > 30
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High document generation time"
      description: "95th percentile document generation time is {{ $value }} seconds"

  - alert: HighDocumentStorageUsage
    expr: document_storage_used / document_storage_total * 100 > 80
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "High document storage usage"
      description: "Document storage usage is above 80% (current: {{ $value }}%)"

  - alert: LowDocumentConversionSuccessRate
    expr: document_conversion_failed_total / document_conversion_total * 100 > 5
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Low document conversion success rate"
      description: "Document conversion success rate is below 95% (current: {{ $value }}%)"
```

## 12. 测试策略

### 12.1 文档功能测试

1. **单元测试**：对文档服务、版本管理、搜索功能等核心组件进行单元测试
2. **集成测试**：测试文档系统与其他系统组件的集成
3. **端到端测试**：测试完整的文档流程，包括创建、更新、版本管理、搜索等
4. **性能测试**：测试文档系统在高负载下的表现，包括文档生成、搜索等功能
5. **兼容性测试**：测试不同格式文档的生成、转换和显示

### 12.2 测试工具与框架

```typescript
// src/test/document/DocumentService.test.ts
import { DocumentServiceImpl } from '../../src/application/services/impl/DocumentServiceImpl';
import { DocumentRepository } from '../../src/domain/repositories/DocumentRepository';
import { DocumentType } from '../../src/domain/enums/DocumentType';
import { DocumentFormat } from '../../src/domain/enums/DocumentFormat';

describe('DocumentServiceImpl', () => {
  let documentService: DocumentServiceImpl;
  let mockDocumentRepository: jest.Mocked<DocumentRepository>;

  beforeEach(() => {
    mockDocumentRepository = {
      save: jest.fn().mockResolvedValue({} as any),
      findById: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({} as any),
      delete: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
      search: jest.fn().mockResolvedValue({ items: [], total: 0 })
    } as any;

    documentService = new DocumentServiceImpl(
      mockDocumentRepository
    );
  });

  it('should create a document successfully', async () => {
    const document = await documentService.createDocument({
      title: 'Test Document',
      type: DocumentType.TECHNICAL,
      content: '# Test Document\n\nThis is a test document.',
      format: DocumentFormat.MARKDOWN,
      author: 'test-user',
      tags: ['test', 'document'],
      category: 'test'
    });

    expect(document).toBeDefined();
    expect(document.title).toBe('Test Document');
    expect(document.type).toBe(DocumentType.TECHNICAL);
    expect(mockDocumentRepository.save).toHaveBeenCalledTimes(1);
  });

  // 其他测试用例
});
```

## 13. 代码质量保证

### 13.1 代码规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规范
- 函数级注释覆盖率100%
- 核心逻辑单元测试覆盖率≥90%
- 定期进行代码审查
- 使用静态代码分析工具检测潜在的文档相关问题

### 13.2 静态代码分析

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    // 文档相关规则
    "max-lines": ["warn", 300],
    "require-await": "error",
    "no-sync": "warn",
    // 其他规则
  }
}
```

## 14. 维护与演进

### 14.1 文档系统维护

- 定期备份文档数据，确保数据安全
- 定期清理过期文档，释放存储空间
- 更新文档模板，适应业务变化
- 优化文档搜索算法，提高搜索效率
- 改进文档生成质量，提高用户满意度

### 14.2 系统演进

1. **阶段1**：基础文档管理功能
2. **阶段2**：文档版本管理和搜索功能
3. **阶段3**：AI驱动的文档生成和优化
4. **阶段4**：文档协作和实时编辑
5. **阶段5**：智能文档推荐和知识图谱集成

## 15. 总结

本技术实现文档详细设计了一个基于Clean Architecture的文档管理系统，包括：

- 完整的分层架构设计
- 核心领域模型和服务接口
- 多存储后端支持（文件系统和S3云存储）
- 文档版本管理和搜索功能
- AI驱动的文档生成、优化和摘要
- 详细的API设计和部署配置
- 全面的性能优化和监控方案
- 完善的测试策略

该设计遵循了项目的架构原则和技术约束，同时提供了良好的可扩展性和可维护性，能够满足认知辅助系统的文档管理需求。系统设计考虑了文档的全生命周期管理，从创建、编辑、版本管理到发布和归档，确保文档的完整性、一致性和可访问性。

通过AI驱动的文档生成和优化功能，该系统能够提高文档创建和维护的效率，减少人工工作量，同时提高文档的质量和可读性。系统还提供了强大的搜索功能，使用户能够快速找到所需的文档，提高工作效率。

该文档管理系统的实现将有助于提高认知辅助系统的可维护性和可扩展性，为系统的持续演进提供良好的支持。