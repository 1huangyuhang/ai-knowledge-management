# 92-语音处理模块技术实现文档

## 1. 模块概述

语音处理模块负责处理用户的语音输入，包括语音录制、音频文件上传、语音转文字和语音分析，为AI分析提供结构化的文本数据。

## 2. 架构设计

### 2.1 分层结构

| 层级 | 组件 | 职责 |
|------|------|------|
| 表示层 | SpeechToTextController | 处理语音输入请求 |
| 应用层 | SpeechRecognitionService | 协调语音识别流程 |
| 应用层 | AudioProcessor | 处理音频文件 |
| 基础设施层 | AudioStorageService | 音频存储管理 |
| 基础设施层 | WhisperAPIClient | 集成OpenAI Whisper API |
| 领域层 | SpeechInput | 语音输入实体 |

### 2.2 核心组件

#### 2.2.1 SpeechToTextController

**职责**：处理语音输入请求，验证音频文件，调用语音识别服务。

**关键接口**：
- `uploadAudio(req: Request, res: Response)`：上传音频文件并转换为文本
- `getTranscriptions(req: Request, res: Response)`：获取转录历史
- `getSingleTranscription(req: Request, res: Response)`：获取单个转录详情

#### 2.2.2 SpeechRecognitionService

**职责**：协调语音识别流程，包括音频处理、转录和结果处理。

**关键接口**：
- `recognizeSpeech(audioFile: Express.Multer.File, options: RecognitionOptions)`：识别语音并转换为文本
- `validateAudio(audioFile: Express.Multer.File)`：验证音频文件格式和大小
- `analyzeSpeechContent(text: string)`：分析语音转录内容

#### 2.2.3 AudioProcessor

**职责**：处理音频文件，包括格式转换、降噪和音频增强。

**关键接口**：
- `convertFormat(inputPath: string, outputFormat: string)`：转换音频格式
- `reduceNoise(inputPath: string)`：降低音频噪音
- `enhanceAudio(inputPath: string)`：增强音频质量
- `extractAudioMetadata(inputPath: string)`：提取音频元数据

#### 2.2.4 WhisperAPIClient

**职责**：集成OpenAI Whisper API，实现语音转文字功能。

**关键接口**：
- `transcribe(audioPath: string, language?: string)`：调用Whisper API进行语音转录
- `translate(audioPath: string, targetLanguage: string)`：调用Whisper API进行语音翻译

#### 2.2.5 AudioStorageService

**职责**：管理音频文件的存储和检索。

**关键接口**：
- `saveAudio(audio: Buffer, filename: string, mimeType: string)`：保存音频文件
- `getAudioPath(audioId: string)`：获取音频文件路径
- `deleteAudio(audioId: string)`：删除音频文件

## 3. 数据流设计

```
用户上传音频 → SpeechToTextController → AudioStorageService (保存音频)
                                         ↓
                                    SpeechRecognitionService → AudioProcessor (处理音频)
                                         ↓
                                    WhisperAPIClient → 调用OpenAI Whisper API
                                         ↓
                                    处理转录结果 → 创建SpeechInput实体
                                         ↓
                                    创建AITask → 发送到AI调度层
```

## 4. 技术选型

| 技术/库 | 用途 | 版本 |
|---------|------|------|
| multer | 音频上传处理 | ^1.4.5-lts.1 |
| openai | OpenAI API客户端 | ^4.28.4 |
| fluent-ffmpeg | 音频处理 | ^2.1.2 |
| ffmpeg-static | FFmpeg静态库 | ^5.2.0 |
| wav | WAV音频处理 | ^1.0.2 |
| @ffmpeg-installer/ffmpeg | FFmpeg安装器 | ^1.1.0 |

## 5. 代码实现

### 5.1 SpeechToTextController

```typescript
// src/application/controllers/SpeechToTextController.ts
import { Request, Response } from 'express';
import { SpeechRecognitionService } from '../services/SpeechRecognitionService';
import { inject, injectable } from 'inversify';

@injectable()
export class SpeechToTextController {
  constructor(
    @inject(SpeechRecognitionService) private readonly speechRecognitionService: SpeechRecognitionService
  ) {}

  /**
   * 上传音频文件并转换为文本
   * @param req 请求对象
   * @param res 响应对象
   */
  public async uploadAudio(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: '请选择要上传的音频文件' });
        return;
      }

      const options = {
        language: req.body.language || 'zh',
        translate: req.body.translate || false,
        targetLanguage: req.body.targetLanguage || 'en'
      };

      const result = await this.speechRecognitionService.recognizeSpeech(req.file, options);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 其他方法...
}
```

### 5.2 SpeechRecognitionService

```typescript
// src/application/services/SpeechRecognitionService.ts
import { injectable } from 'inversify';
import { SpeechInput } from '../../domain/entities/SpeechInput';
import { AudioProcessor } from './AudioProcessor';
import { WhisperAPIClient } from '../infrastructure/WhisperAPIClient';
import { AudioStorageService } from '../infrastructure/AudioStorageService';
import { AITask } from '../../domain/entities/AITask';
import { AITaskStatus, AITaskPriority } from '../../domain/entities/AITask';

/**
 * 语音识别选项
 */
export interface RecognitionOptions {
  language?: string;
  translate?: boolean;
  targetLanguage?: string;
}

@injectable()
export class SpeechRecognitionService {
  constructor(
    private readonly audioProcessor: AudioProcessor,
    private readonly whisperAPIClient: WhisperAPIClient,
    private readonly audioStorageService: AudioStorageService
  ) {}

  /**
   * 识别语音并转换为文本
   * @param audioFile 音频文件
   * @param options 识别选项
   * @returns 识别结果
   */
  public async recognizeSpeech(
    audioFile: Express.Multer.File,
    options: RecognitionOptions
  ): Promise<SpeechInput> {
    // 1. 保存音频文件
    const audioPath = await this.audioStorageService.saveAudio(
      audioFile.buffer, 
      audioFile.originalname, 
      audioFile.mimetype
    );
    
    // 2. 处理音频文件（转换格式、降噪等）
    const processedAudioPath = await this.audioProcessor.processAudio(audioPath);
    
    // 3. 提取音频元数据
    const metadata = await this.audioProcessor.extractAudioMetadata(processedAudioPath);
    
    // 4. 调用Whisper API进行转录
    let transcriptionResult;
    if (options.translate) {
      transcriptionResult = await this.whisperAPIClient.translate(
        processedAudioPath, 
        options.targetLanguage || 'en'
      );
    } else {
      transcriptionResult = await this.whisperAPIClient.transcribe(
        processedAudioPath, 
        options.language
      );
    }
    
    // 5. 创建SpeechInput实体
    const speechInput = new SpeechInput({
      audioUrl: processedAudioPath,
      transcription: transcriptionResult.text,
      confidence: transcriptionResult.confidence || 0.9,
      language: options.language || 'zh',
      duration: metadata.duration,
      metadata: {
        ...metadata,
        originalFilename: audioFile.originalname,
        encoding: audioFile.encoding,
        processingOptions: options
      }
    });
    
    // 6. 创建AI任务
    const aiTask = new AITask({
      type: 'SPEECH_PROCESSING',
      status: AITaskStatus.PENDING,
      priority: AITaskPriority.MEDIUM,
      input: { speechId: speechInput.id }
    });
    
    // 7. 保存到数据库（后续实现）
    
    return speechInput;
  }

  // 其他方法...
}
```

### 5.3 WhisperAPIClient

```typescript
// src/infrastructure/WhisperAPIClient.ts
import OpenAI from 'openai';
import { injectable } from 'inversify';
import fs from 'fs';

/**
 * Whisper API转录结果
 */
export interface WhisperTranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

@injectable()
export class WhisperAPIClient {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * 调用Whisper API进行语音转录
   * @param audioPath 音频文件路径
   * @param language 语言代码
   * @returns 转录结果
   */
  public async transcribe(
    audioPath: string,
    language?: string
  ): Promise<WhisperTranscriptionResult> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language,
        response_format: 'json',
        timestamp_granularities: ['segment'],
        temperature: 0.0
      });

      return {
        text: response.text,
        confidence: response.segments?.[0]?.confidence || 0.9,
        segments: response.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          confidence: segment.confidence
        }))
      };
    } catch (error: any) {
      throw new Error(`Whisper API转录失败: ${error.message}`);
    }
  }

  /**
   * 调用Whisper API进行语音翻译
   * @param audioPath 音频文件路径
   * @param targetLanguage 目标语言
   * @returns 翻译结果
   */
  public async translate(
    audioPath: string,
    targetLanguage: string
  ): Promise<WhisperTranscriptionResult> {
    try {
      const response = await this.openai.audio.translations.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        response_format: 'json',
        timestamp_granularities: ['segment'],
        temperature: 0.0
      });

      return {
        text: response.text,
        confidence: response.segments?.[0]?.confidence || 0.9,
        segments: response.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          confidence: segment.confidence
        }))
      };
    } catch (error: any) {
      throw new Error(`Whisper API翻译失败: ${error.message}`);
    }
  }
}
```

## 6. 测试策略

### 6.1 单元测试

- 测试SpeechRecognitionService的语音识别逻辑
- 测试AudioProcessor的音频处理功能
- 测试WhisperAPIClient的API调用（使用Mock）

### 6.2 集成测试

- 测试完整的语音转文字流程
- 测试不同音频格式的处理结果
- 测试不同语言的转录效果

### 6.3 端到端测试

- 测试从API调用到语音转录完成的完整流程
- 测试错误处理和边界情况
- 测试音频质量对转录结果的影响

## 7. 部署和监控

- 音频存储使用本地存储，生产环境可扩展为云存储
- 实现语音处理的日志记录
- 监控语音处理的性能和成功率
- 实现API调用失败的重试机制
- 监控API调用成本和使用量

## 8. 扩展考虑

- 支持实时语音识别
- 实现多语言自动检测
- 集成更多语音识别引擎
- 实现语音情感分析
- 支持说话人识别和分离