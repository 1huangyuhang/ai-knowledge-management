# 91-文件处理模块技术实现文档

## 1. 模块概述

文件处理模块负责处理用户上传的各种格式文件，包括文档解析、OCR识别和内容提取，为AI分析提供结构化数据。

## 2. 架构设计

### 2.1 分层结构

| 层级 | 组件 | 职责 |
|------|------|------|
| 表示层 | FileUploadController | 处理文件上传请求 |
| 应用层 | FileProcessorService | 协调文件处理流程 |
| 应用层 | DocumentParser | 解析不同格式文档 |
| 应用层 | OCRService | 处理图像文字识别 |
| 基础设施层 | FileStorageService | 文件存储管理 |
| 领域层 | FileInput | 文件输入实体 |

### 2.2 核心组件

#### 2.2.1 FileUploadController

**职责**：处理文件上传请求，验证文件格式和大小，调用文件处理服务。

**关键接口**：
- `uploadFile(req: Request, res: Response)`：处理文件上传
- `getUploadedFiles(req: Request, res: Response)`：获取上传文件列表
- `getSingleFile(req: Request, res: Response)`：获取单个文件详情

#### 2.2.2 FileProcessorService

**职责**：协调文件处理流程，包括文件解析、OCR识别和内容提取。

**关键接口**：
- `processFile(file: Express.Multer.File, metadata: Record<string, any>)`：处理上传文件
- `extractTextFromFile(filePath: string, fileType: string)`：从文件中提取文本
- `validateFile(file: Express.Multer.File)`：验证文件格式和大小

#### 2.2.3 DocumentParser

**职责**：解析不同格式的文档，如PDF、Word、Excel等。

**关键接口**：
- `parsePDF(filePath: string)`：解析PDF文档
- `parseWord(filePath: string)`：解析Word文档
- `parseExcel(filePath: string)`：解析Excel文档
- `parsePlainText(filePath: string)`：解析纯文本文件

#### 2.2.4 OCRService

**职责**：处理图像文件的文字识别，支持JPG、PNG等格式。

**关键接口**：
- `performOCR(filePath: string, language: string = 'zh')`：执行OCR识别
- `extractTextFromImage(filePath: string)`：从图像中提取文本

#### 2.2.5 FileStorageService

**职责**：管理文件的存储和检索，支持本地存储和云存储。

**关键接口**：
- `saveFile(file: Buffer, filename: string, mimeType: string)`：保存文件
- `getFilePath(fileId: string)`：获取文件路径
- `deleteFile(fileId: string)`：删除文件

## 3. 数据流设计

```
用户上传文件 → FileUploadController → FileStorageService (保存文件)
                                      ↓
                                 FileProcessorService → DocumentParser/OCRService → 提取文本
                                      ↓
                                 创建FileInput实体 → 存储到数据库
                                      ↓
                                 创建AITask → 发送到AI调度层
```

## 4. 技术选型

| 技术/库 | 用途 | 版本 |
|---------|------|------|
| multer | 文件上传处理 | ^1.4.5-lts.1 |
| pdf-parse | PDF文档解析 | ^1.1.1 |
| mammoth | Word文档解析 | ^1.6.0 |
| xlsx | Excel文档解析 | ^0.18.5 |
| tesseract.js | OCR识别 | ^5.0.3 |
| sharp | 图像处理 | ^0.32.1 |

## 5. 代码实现

### 5.1 FileUploadController

```typescript
// src/application/controllers/FileUploadController.ts
import { Request, Response } from 'express';
import { FileProcessorService } from '../services/FileProcessorService';
import { inject, injectable } from 'inversify';

@injectable()
export class FileUploadController {
  constructor(
    @inject(FileProcessorService) private readonly fileProcessorService: FileProcessorService
  ) {}

  /**
   * 处理文件上传
   * @param req 请求对象
   * @param res 响应对象
   */
  public async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: '请选择要上传的文件' });
        return;
      }

      const result = await this.fileProcessorService.processFile(req.file, req.body.metadata || {});
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 其他方法...
}
```

### 5.2 FileProcessorService

```typescript
// src/application/services/FileProcessorService.ts
import { injectable } from 'inversify';
import { FileInput } from '../../domain/entities/FileInput';
import { DocumentParser } from './DocumentParser';
import { OCRService } from './OCRService';
import { FileStorageService } from '../infrastructure/FileStorageService';
import { AITask } from '../../domain/entities/AITask';
import { AITaskStatus, AITaskPriority } from '../../domain/entities/AITask';

@injectable()
export class FileProcessorService {
  constructor(
    private readonly documentParser: DocumentParser,
    private readonly ocrService: OCRService,
    private readonly fileStorageService: FileStorageService
  ) {}

  /**
   * 处理上传文件
   * @param file 上传的文件
   * @param metadata 文件元数据
   * @returns 处理结果
   */
  public async processFile(file: Express.Multer.File, metadata: Record<string, any>): Promise<FileInput> {
    // 1. 保存文件
    const filePath = await this.fileStorageService.saveFile(file.buffer, file.originalname, file.mimetype);
    
    // 2. 提取文本内容
    let content = '';
    if (file.mimetype.startsWith('image/')) {
      // 图像文件使用OCR
      content = await this.ocrService.performOCR(filePath);
    } else {
      // 文档文件使用文档解析器
      content = await this.documentParser.extractText(filePath, file.mimetype);
    }
    
    // 3. 创建FileInput实体
    const fileInput = new FileInput({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      content,
      metadata: {
        ...metadata,
        filePath,
        originalFilename: file.originalname,
        encoding: file.encoding
      }
    });
    
    // 4. 创建AI任务
    const aiTask = new AITask({
      type: 'FILE_PROCESSING',
      status: AITaskStatus.PENDING,
      priority: AITaskPriority.MEDIUM,
      input: { fileId: fileInput.id }
    });
    
    // 5. 保存到数据库（后续实现）
    
    return fileInput;
  }

  // 其他方法...
}
```

## 6. 测试策略

### 6.1 单元测试

- 测试FileProcessorService的文件处理逻辑
- 测试DocumentParser的各种文档格式解析
- 测试OCRService的图像文字识别

### 6.2 集成测试

- 测试完整的文件上传和处理流程
- 测试不同文件格式的处理结果
- 测试大文件上传和处理

### 6.3 端到端测试

- 测试从API调用到文件处理完成的完整流程
- 测试错误处理和边界情况

## 7. 部署和监控

- 文件存储使用本地存储，生产环境可扩展为云存储
- 实现文件处理的日志记录
- 监控文件处理的性能和成功率
- 实现文件处理失败的重试机制

## 8. 扩展考虑

- 支持更多文件格式
- 实现分布式文件处理
- 集成更多OCR引擎
- 实现文件内容的自动分类和标签生成