# Day 16: 仓库实现 - 代码实现文档

## 1. 当日主题概述

### 1.1 核心开发目标
- 实现各种Repository接口的具体实现
- 完善数据库操作逻辑
- 实现事件系统的基础结构
- 编写全面的单元测试
- 确保各仓库之间的协同工作

### 1.2 技术要点
- Repository模式
- SQLite数据库操作
- 事件驱动设计
- 单元测试
- 错误处理

## 2. Repository实现

### 2.1 认知模型仓库实现

```typescript
// src/infrastructure/persistence/repositories/CognitiveModelRepositoryImpl.ts

import { CognitiveModelRepository } from '../../../application/interfaces/repository/CognitiveModelRepository';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../../domain/entities/CognitiveRelation';
import { BaseRepositoryImpl } from '../BaseRepositoryImpl';

export class CognitiveModelRepositoryImpl extends BaseRepositoryImpl implements CognitiveModelRepository {
  /**
   * 保存认知模型
   * @param model 认知模型实体
   * @returns 保存后的认知模型实体
   */
  public async save(model: UserCognitiveModel): Promise<UserCognitiveModel> {
    const connection = await this.connectionPool.getConnection();
    
    return connection.transaction(async (tx) => {
      // 保存认知模型
      const modelSql = `
        INSERT OR REPLACE INTO user_cognitive_models (id, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `;
      
      const modelParams = [
        model.id,
        model.userId,
        model.createdAt.toISOString(),
        model.updatedAt.toISOString()
      ];
      
      await tx.execute(modelSql, modelParams);
      
      // 保存概念
      for (const concept of model.concepts) {
        await this.saveConcept(tx, concept);
        
        // 保存模型-概念关联
        const modelConceptSql = `
          INSERT OR REPLACE INTO model_concepts (model_id, concept_id)
          VALUES (?, ?)
        `;
        
        await tx.execute(modelConceptSql, [model.id, concept.id]);
      }
      
      // 保存关系
      for (const relation of model.relations) {
        await this.saveRelation(tx, relation);
        
        // 保存模型-关系关联
        const modelRelationSql = `
          INSERT OR REPLACE INTO model_relations (model_id, relation_id)
          VALUES (?, ?)
        `;
        
        await tx.execute(modelRelationSql, [model.id, relation.id]);
      }
      
      return model;
    });
  }
  
  /**
   * 根据ID查找认知模型
   * @param id 认知模型ID
   * @returns 认知模型实体或null
   */
  public async findById(id: string): Promise<UserCognitiveModel | null> {
    const connection = await this.connectionPool.getConnection();
    
    // 查询认知模型
    const modelSql = 'SELECT * FROM user_cognitive_models WHERE id = ?';
    const modelResults = await connection.query(modelSql, [id]);
    
    if (modelResults.length === 0) {
      return null;
    }
    
    const modelRow = modelResults[0];
    
    // 查询关联的概念
    const concepts = await this.findConceptsByModelId(connection, id);
    
    // 查询关联的关系
    const relations = await this.findRelationsByModelId(connection, id);
    
    return {
      id: modelRow.id,
      userId: modelRow.user_id,
      concepts,
      relations,
      evolutionHistory: [], // 演化历史将在单独的方法中查询
      createdAt: new Date(modelRow.created_at),
      updatedAt: new Date(modelRow.updated_at)
    };
  }
  
  /**
   * 根据用户ID查找认知模型
   * @param userId 用户ID
   * @returns 认知模型实体或null
   */
  public async findByUserId(userId: string): Promise<UserCognitiveModel | null> {
    const connection = await this.connectionPool.getConnection();
    
    // 查询认知模型
    const modelSql = 'SELECT * FROM user_cognitive_models WHERE user_id = ?';
    const modelResults = await connection.query(modelSql, [userId]);
    
    if (modelResults.length === 0) {
      return null;
    }
    
    const modelRow = modelResults[0];
    
    // 查询关联的概念
    const concepts = await this.findConceptsByModelId(connection, modelRow.id);
    
    // 查询关联的关系
    const relations = await this.findRelationsByModelId(connection, modelRow.id);
    
    return {
      id: modelRow.id,
      userId: modelRow.user_id,
      concepts,
      relations,
      evolutionHistory: [], // 演化历史将在单独的方法中查询
      createdAt: new Date(modelRow.created_at),
      updatedAt: new Date(modelRow.updated_at)
    };
  }
  
  /**
   * 保存概念
   * @param connection 数据库连接
   * @param concept 概念实体
   */
  private async saveConcept(connection: any, concept: CognitiveConcept): Promise<void> {
    const conceptSql = `
      INSERT OR REPLACE INTO cognitive_concepts 
      (id, semantic_identity, abstraction_level, confidence_score, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const conceptParams = [
      concept.id,
      concept.semanticIdentity,
      concept.abstractionLevel,
      concept.confidenceScore,
      concept.description,
      concept.createdAt.toISOString(),
      concept.updatedAt.toISOString()
    ];
    
    await connection.execute(conceptSql, conceptParams);
  }
  
  /**
   * 保存关系
   * @param connection 数据库连接
   * @param relation 关系实体
   */
  private async saveRelation(connection: any, relation: CognitiveRelation): Promise<void> {
    const relationSql = `
      INSERT OR REPLACE INTO cognitive_relations 
      (id, source_concept_id, target_concept_id, relation_type, confidence_score, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const relationParams = [
      relation.id,
      relation.sourceConceptId,
      relation.targetConceptId,
      relation.relationType,
      relation.confidenceScore,
      relation.createdAt.toISOString(),
      relation.updatedAt.toISOString()
    ];
    
    await connection.execute(relationSql, relationParams);
  }
  
  /**
   * 根据模型ID查找概念
   * @param connection 数据库连接
   * @param modelId 模型ID
   * @returns 概念列表
   */
  private async findConceptsByModelId(connection: any, modelId: string): Promise<CognitiveConcept[]> {
    const sql = `
      SELECT c.* FROM cognitive_concepts c
      INNER JOIN model_concepts mc ON c.id = mc.concept_id
      WHERE mc.model_id = ?
    `;
    
    const results = await connection.query(sql, [modelId]);
    
    return results.map((row: any) => ({
      id: row.id,
      semanticIdentity: row.semantic_identity,
      abstractionLevel: row.abstraction_level,
      confidenceScore: row.confidence_score,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
  
  /**
   * 根据模型ID查找关系
   * @param connection 数据库连接
   * @param modelId 模型ID
   * @returns 关系列表
   */
  private async findRelationsByModelId(connection: any, modelId: string): Promise<CognitiveRelation[]> {
    const sql = `
      SELECT r.* FROM cognitive_relations r
      INNER JOIN model_relations mr ON r.id = mr.relation_id
      WHERE mr.model_id = ?
    `;
    
    const results = await connection.query(sql, [modelId]);
    
    return results.map((row: any) => ({
      id: row.id,
      sourceConceptId: row.source_concept_id,
      targetConceptId: row.target_concept_id,
      relationType: row.relation_type,
      confidenceScore: row.confidence_score,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
}
```

### 2.2 认知建议仓库实现

```typescript
// src/infrastructure/persistence/repositories/CognitiveProposalRepositoryImpl.ts

import { CognitiveProposalRepository } from '../../../application/interfaces/repository/CognitiveProposalRepository';
import { CognitiveProposal } from '../../../domain/entities/CognitiveProposal';
import { ConceptCandidate } from '../../../domain/value-objects/ConceptCandidate';
import { RelationCandidate } from '../../../domain/value-objects/RelationCandidate';
import { BaseRepositoryImpl } from '../BaseRepositoryImpl';

export class CognitiveProposalRepositoryImpl extends BaseRepositoryImpl implements CognitiveProposalRepository {
  /**
   * 保存认知建议
   * @param proposal 认知建议实体
   * @returns 保存后的认知建议实体
   */
  public async save(proposal: CognitiveProposal): Promise<CognitiveProposal> {
    const connection = await this.connectionPool.getConnection();
    
    return connection.transaction(async (tx) => {
      // 保存认知建议
      const proposalSql = `
        INSERT INTO cognitive_proposals (id, thought_id, confidence, reasoning_trace, created_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const proposalParams = [
        proposal.id,
        proposal.thoughtId,
        proposal.confidence,
        this.stringifyJson(proposal.reasoningTrace),
        proposal.createdAt.toISOString()
      ];
      
      await tx.execute(proposalSql, proposalParams);
      
      // 保存概念候选
      for (const concept of proposal.concepts) {
        const conceptSql = `
          INSERT INTO proposal_concept_candidates 
          (id, proposal_id, semantic_identity, abstraction_level, confidence_score, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const conceptParams = [
          this.generateId(),
          proposal.id,
          concept.semanticIdentity,
          concept.abstractionLevel,
          concept.confidenceScore,
          concept.description
        ];
        
        await tx.execute(conceptSql, conceptParams);
      }
      
      // 保存关系候选
      for (const relation of proposal.relations) {
        const relationSql = `
          INSERT INTO proposal_relation_candidates 
          (id, proposal_id, source_semantic_identity, target_semantic_identity, relation_type, confidence_score)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const relationParams = [
          this.generateId(),
          proposal.id,
          relation.sourceSemanticIdentity,
          relation.targetSemanticIdentity,
          relation.relationType,
          relation.confidenceScore
        ];
        
        await tx.execute(relationSql, relationParams);
      }
      
      return proposal;
    });
  }
  
  /**
   * 根据ID查找认知建议
   * @param id 认知建议ID
   * @returns 认知建议实体或null
   */
  public async findById(id: string): Promise<CognitiveProposal | null> {
    const connection = await this.connectionPool.getConnection();
    
    // 查询认知建议
    const proposalSql = 'SELECT * FROM cognitive_proposals WHERE id = ?';
    const proposalResults = await connection.query(proposalSql, [id]);
    
    if (proposalResults.length === 0) {
      return null;
    }
    
    const proposalRow = proposalResults[0];
    
    // 查询关联的概念候选
    const concepts = await this.findConceptCandidatesByProposalId(connection, id);
    
    // 查询关联的关系候选
    const relations = await this.findRelationCandidatesByProposalId(connection, id);
    
    return {
      id: proposalRow.id,
      thoughtId: proposalRow.thought_id,
      concepts,
      relations,
      confidence: proposalRow.confidence,
      reasoningTrace: this.parseJson<string[]>(proposalRow.reasoning_trace) || [],
      createdAt: new Date(proposalRow.created_at)
    };
  }
  
  /**
   * 根据思维片段ID查找认知建议
   * @param thoughtId 思维片段ID
   * @returns 认知建议列表
   */
  public async findByThoughtId(thoughtId: string): Promise<CognitiveProposal[]> {
    const connection = await this.connectionPool.getConnection();
    
    // 查询认知建议
    const proposalSql = 'SELECT * FROM cognitive_proposals WHERE thought_id = ?';
    const proposalResults = await connection.query(proposalSql, [thoughtId]);
    
    const proposals: CognitiveProposal[] = [];
    
    // 为每个建议查询关联的概念和关系
    for (const proposalRow of proposalResults) {
      const concepts = await this.findConceptCandidatesByProposalId(connection, proposalRow.id);
      const relations = await this.findRelationCandidatesByProposalId(connection, proposalRow.id);
      
      proposals.push({
        id: proposalRow.id,
        thoughtId: proposalRow.thought_id,
        concepts,
        relations,
        confidence: proposalRow.confidence,
        reasoningTrace: this.parseJson<string[]>(proposalRow.reasoning_trace) || [],
        createdAt: new Date(proposalRow.created_at)
      });
    }
    
    return proposals;
  }
  
  /**
   * 根据建议ID查找概念候选
   * @param connection 数据库连接
   * @param proposalId 建议ID
   * @returns 概念候选列表
   */
  private async findConceptCandidatesByProposalId(connection: any, proposalId: string): Promise<ConceptCandidate[]> {
    const sql = 'SELECT * FROM proposal_concept_candidates WHERE proposal_id = ?';
    const results = await connection.query(sql, [proposalId]);
    
    return results.map((row: any) => ({
      semanticIdentity: row.semantic_identity,
      abstractionLevel: row.abstraction_level,
      confidenceScore: row.confidence_score,
      description: row.description
    }));
  }
  
  /**
   * 根据建议ID查找关系候选
   * @param connection 数据库连接
   * @param proposalId 建议ID
   * @returns 关系候选列表
   */
  private async findRelationCandidatesByProposalId(connection: any, proposalId: string): Promise<RelationCandidate[]> {
    const sql = 'SELECT * FROM proposal_relation_candidates WHERE proposal_id = ?';
    const results = await connection.query(sql, [proposalId]);
    
    return results.map((row: any) => ({
      sourceSemanticIdentity: row.source_semantic_identity,
      targetSemanticIdentity: row.target_semantic_identity,
      relationType: row.relation_type,
      confidenceScore: row.confidence_score
    }));
  }
}
```

### 2.3 认知洞察仓库实现

```typescript
// src/infrastructure/persistence/repositories/CognitiveInsightRepositoryImpl.ts

import { CognitiveInsightRepository } from '../../../application/interfaces/repository/CognitiveInsightRepository';
import { CognitiveInsight } from '../../../domain/entities/CognitiveInsight';
import { BaseRepositoryImpl } from '../BaseRepositoryImpl';

export class CognitiveInsightRepositoryImpl extends BaseRepositoryImpl implements CognitiveInsightRepository {
  /**
   * 保存认知洞察
   * @param insight 认知洞察实体
   * @returns 保存后的认知洞察实体
   */
  public async save(insight: CognitiveInsight): Promise<CognitiveInsight> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = `
      INSERT INTO cognitive_insights (id, model_id, core_themes, blind_spots, concept_gaps, structure_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      insight.id,
      insight.modelId,
      this.stringifyJson(insight.coreThemes),
      this.stringifyJson(insight.blindSpots),
      this.stringifyJson(insight.conceptGaps),
      insight.structureSummary,
      insight.createdAt.toISOString()
    ];
    
    await connection.execute(sql, params);
    return insight;
  }
  
  /**
   * 根据ID查找认知洞察
   * @param id 认知洞察ID
   * @returns 认知洞察实体或null
   */
  public async findById(id: string): Promise<CognitiveInsight | null> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM cognitive_insights WHERE id = ?';
    const results = await connection.query(sql, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    
    return {
      id: row.id,
      modelId: row.model_id,
      coreThemes: this.parseJson<string[]>(row.core_themes) || [],
      blindSpots: this.parseJson<string[]>(row.blind_spots) || [],
      conceptGaps: this.parseJson<string[]>(row.concept_gaps) || [],
      structureSummary: row.structure_summary,
      createdAt: new Date(row.created_at)
    };
  }
  
  /**
   * 根据模型ID查找认知洞察
   * @param modelId 模型ID
   * @returns 认知洞察列表
   */
  public async findByModelId(modelId: string): Promise<CognitiveInsight[]> {
    const connection = await this.connectionPool.getConnection();
    
    const sql = 'SELECT * FROM cognitive_insights WHERE model_id = ? ORDER BY created_at DESC';
    const results = await connection.query(sql, [modelId]);
    
    return results.map((row: any) => ({
      id: row.id,
      modelId: row.model_id,
      coreThemes: this.parseJson<string[]>(row.core_themes) || [],
      blindSpots: this.parseJson<string[]>(row.blind_spots) || [],
      conceptGaps: this.parseJson<string[]>(row.concept_gaps) || [],
      structureSummary: row.structure_summary,
      createdAt: new Date(row.created_at)
    }));
  }
}
```

## 3. 事件系统实现

### 3.1 事件总线接口

```typescript
// src/application/interfaces/event/EventBus.ts

export interface EventBus {
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  
  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  publish<T>(eventType: string, event: T): void;
}

export interface EventHandler<T> {
  /**
   * 处理事件
   * @param event 事件数据
   */
  handle(event: T): void;
}
```

### 3.2 事件总线实现

```typescript
// src/infrastructure/event-bus/EventBusImpl.ts

import { EventBus, EventHandler } from '../../application/interfaces/event/EventBus';

export class EventBusImpl implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  public publish<T>(eventType: string, event: T): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler.handle(event);
        } catch (error) {
          console.error(`Error handling event ${eventType}:`, error);
        }
      });
    }
  }
}
```

### 3.3 事件类型定义

```typescript
// src/application/events/EventType.ts

export enum EventType {
  THOUGHT_INGESTED = 'ThoughtIngested',
  COGNITIVE_PROPOSAL_GENERATED = 'CognitiveProposalGenerated',
  COGNITIVE_MODEL_UPDATED = 'CognitiveModelUpdated',
  COGNITIVE_INSIGHT_GENERATED = 'CognitiveInsightGenerated'
}
```

### 3.4 事件数据结构

```typescript
// src/application/events/ThoughtIngestedEvent.ts

export interface ThoughtIngestedEvent {
  thoughtId: string;
  content: string;
  timestamp: Date;
}

// src/application/events/CognitiveProposalGeneratedEvent.ts

export interface CognitiveProposalGeneratedEvent {
  proposalId: string;
  thoughtId: string;
  timestamp: Date;
}

// src/application/events/CognitiveModelUpdatedEvent.ts

export interface CognitiveModelUpdatedEvent {
  modelId: string;
  userId: string;
  timestamp: Date;
  changes: any;
}

// src/application/events/CognitiveInsightGeneratedEvent.ts

export interface CognitiveInsightGeneratedEvent {
  insightId: string;
  modelId: string;
  timestamp: Date;
}
```

## 4. 日志系统实现

### 4.1 日志接口

```typescript
// src/application/interfaces/logging/Logger.ts

export interface Logger {
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  debug(message: string, context?: any): void;
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  info(message: string, context?: any): void;
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  warn(message: string, context?: any): void;
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  error(message: string, error?: Error, context?: any): void;
}
```

### 4.2 日志实现

```typescript
// src/infrastructure/logging/LoggerImpl.ts

import { Logger } from '../../application/interfaces/logging/Logger';

export class LoggerImpl implements Logger {
  private readonly logLevel: string;
  
  /**
   * 创建日志实例
   * @param logLevel 日志级别（debug, info, warn, error）
   */
  constructor(logLevel: string = 'info') {
    this.logLevel = logLevel;
  }
  
  /**
   * 记录调试信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public debug(message: string, context?: any): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, context);
    }
  }
  
  /**
   * 记录信息
   * @param message 日志消息
   * @param context 日志上下文
   */
  public info(message: string, context?: any): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, context);
    }
  }
  
  /**
   * 记录警告
   * @param message 日志消息
   * @param context 日志上下文
   */
  public warn(message: string, context?: any): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, context);
    }
  }
  
  /**
   * 记录错误
   * @param message 日志消息
   * @param error 错误对象
   * @param context 日志上下文
   */
  public error(message: string, error?: Error, context?: any): void {
    if (this.shouldLog('error')) {
      this.log('ERROR', message, context, error);
    }
  }
  
  /**
   * 判断是否应该记录该级别的日志
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param context 日志上下文
   * @param error 错误对象
   */
  private log(level: string, message: string, context?: any, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

## 5. 单元测试设计

### 5.1 认知模型仓库测试

```typescript
// src/infrastructure/persistence/__tests__/CognitiveModelRepositoryImpl.test.ts

import { CognitiveModelRepositoryImpl } from '../repositories/CognitiveModelRepositoryImpl';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../../domain/entities/CognitiveRelation';
import { SQLiteConnectionPool } from '../SQLiteConnectionPool';
import { DatabaseInitializer } from '../DatabaseInitializer';
import { unlinkSync, existsSync } from 'fs';

describe('CognitiveModelRepositoryImpl', () => {
  const testDbPath = './test-model-db.sqlite';
  let repository: CognitiveModelRepositoryImpl;
  
  beforeEach(async () => {
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    // 初始化数据库
    const connectionPool = SQLiteConnectionPool.getInstance(testDbPath);
    const connection = await connectionPool.getConnection();
    const initializer = new DatabaseInitializer(connection);
    await initializer.initialize();
    
    repository = new CognitiveModelRepositoryImpl();
  });
  
  afterEach(async () => {
    // 关闭连接池
    const connectionPool = SQLiteConnectionPool.getInstance();
    await connectionPool.close();
    
    // 清理测试数据库文件
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    // 重置单例
    (SQLiteConnectionPool as any).instance = null;
  });
  
  it('should save and find cognitive model by id', async () => {
    // 创建测试模型
    const model: UserCognitiveModel = {
      id: 'model-1',
      userId: 'user-1',
      concepts: [
        {
          id: 'concept-1',
          semanticIdentity: 'test concept',
          abstractionLevel: 3,
          confidenceScore: 0.8,
          description: 'test description',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      relations: [],
      evolutionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存模型
    await repository.save(model);
    
    // 查找模型
    const foundModel = await repository.findById('model-1');
    
    expect(foundModel).toBeDefined();
    expect(foundModel!.id).toBe('model-1');
    expect(foundModel!.concepts.length).toBe(1);
    expect(foundModel!.concepts[0].id).toBe('concept-1');
  });
  
  it('should find cognitive model by user id', async () => {
    // 创建测试模型
    const model: UserCognitiveModel = {
      id: 'model-2',
      userId: 'user-2',
      concepts: [],
      relations: [],
      evolutionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存模型
    await repository.save(model);
    
    // 查找模型
    const foundModel = await repository.findByUserId('user-2');
    
    expect(foundModel).toBeDefined();
    expect(foundModel!.id).toBe('model-2');
    expect(foundModel!.userId).toBe('user-2');
  });
});
```

### 5.2 事件总线测试

```typescript
// src/infrastructure/event-bus/__tests__/EventBusImpl.test.ts

import { EventBusImpl } from '../EventBusImpl';
import { EventHandler } from '../../../application/interfaces/event/EventBus';

describe('EventBusImpl', () => {
  let eventBus: EventBusImpl;
  
  beforeEach(() => {
    eventBus = new EventBusImpl();
  });
  
  it('should publish and subscribe to events', () => {
    const mockHandler = {
      handle: jest.fn()
    } as EventHandler<any>;
    
    // 订阅事件
    eventBus.subscribe('TestEvent', mockHandler);
    
    // 发布事件
    const eventData = { message: 'test' };
    eventBus.publish('TestEvent', eventData);
    
    // 验证事件处理函数被调用
    expect(mockHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler.handle).toHaveBeenCalledWith(eventData);
  });
  
  it('should handle multiple handlers for the same event', () => {
    const mockHandler1 = { handle: jest.fn() } as EventHandler<any>;
    const mockHandler2 = { handle: jest.fn() } as EventHandler<any>;
    
    // 订阅事件
    eventBus.subscribe('TestEvent', mockHandler1);
    eventBus.subscribe('TestEvent', mockHandler2);
    
    // 发布事件
    const eventData = { message: 'test' };
    eventBus.publish('TestEvent', eventData);
    
    // 验证所有事件处理函数被调用
    expect(mockHandler1.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler2.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler1.handle).toHaveBeenCalledWith(eventData);
    expect(mockHandler2.handle).toHaveBeenCalledWith(eventData);
  });
  
  it('should only call handlers for the subscribed event type', () => {
    const mockHandler1 = { handle: jest.fn() } as EventHandler<any>;
    const mockHandler2 = { handle: jest.fn() } as EventHandler<any>;
    
    // 订阅不同事件
    eventBus.subscribe('Event1', mockHandler1);
    eventBus.subscribe('Event2', mockHandler2);
    
    // 发布事件1
    eventBus.publish('Event1', { message: 'event1' });
    
    // 验证只有事件1的处理函数被调用
    expect(mockHandler1.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler2.handle).not.toHaveBeenCalled();
  });
});
```

## 6. 集成与使用示例

### 6.1 仓库工厂

```typescript
// src/infrastructure/persistence/RepositoryFactory.ts

import { ThoughtRepository } from '../../application/interfaces/repository/ThoughtRepository';
import { CognitiveModelRepository } from '../../application/interfaces/repository/CognitiveModelRepository';
import { CognitiveProposalRepository } from '../../application/interfaces/repository/CognitiveProposalRepository';
import { CognitiveInsightRepository } from '../../application/interfaces/repository/CognitiveInsightRepository';
import { ThoughtRepositoryImpl } from './repositories/ThoughtRepositoryImpl';
import { CognitiveModelRepositoryImpl } from './repositories/CognitiveModelRepositoryImpl';
import { CognitiveProposalRepositoryImpl } from './repositories/CognitiveProposalRepositoryImpl';
import { CognitiveInsightRepositoryImpl } from './repositories/CognitiveInsightRepositoryImpl';

export class RepositoryFactory {
  /**
   * 创建思维片段仓库实例
   * @returns 思维片段仓库实例
   */
  public static createThoughtRepository(): ThoughtRepository {
    return new ThoughtRepositoryImpl();
  }
  
  /**
   * 创建认知模型仓库实例
   * @returns 认知模型仓库实例
   */
  public static createCognitiveModelRepository(): CognitiveModelRepository {
    return new CognitiveModelRepositoryImpl();
  }
  
  /**
   * 创建认知建议仓库实例
   * @returns 认知建议仓库实例
   */
  public static createCognitiveProposalRepository(): CognitiveProposalRepository {
    return new CognitiveProposalRepositoryImpl();
  }
  
  /**
   * 创建认知洞察仓库实例
   * @returns 认知洞察仓库实例
   */
  public static createCognitiveInsightRepository(): CognitiveInsightRepository {
    return new CognitiveInsightRepositoryImpl();
  }
}
```

### 6.2 Use Case与Repository集成

```typescript
// src/application/usecases/UpdateCognitiveModelUseCaseImpl.ts

import { UpdateCognitiveModelUseCase } from './UpdateCognitiveModelUseCase';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveModelRepository } from '../interfaces/repository/CognitiveModelRepository';
import { CognitiveProposalRepository } from '../interfaces/repository/CognitiveProposalRepository';
import { EventBus } from '../interfaces/event/EventBus';
import { EventType } from '../events/EventType';
import { CognitiveModelUpdatedEvent } from '../events/CognitiveModelUpdatedEvent';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export class UpdateCognitiveModelUseCaseImpl implements UpdateCognitiveModelUseCase {
  private readonly cognitiveModelRepository: CognitiveModelRepository;
  private readonly cognitiveProposalRepository: CognitiveProposalRepository;
  private readonly eventBus: EventBus;
  
  /**
   * 创建更新认知模型用例实例
   * @param eventBus 事件总线实例
   */
  constructor(eventBus: EventBus) {
    // 使用仓库工厂创建仓库实例
    this.cognitiveModelRepository = RepositoryFactory.createCognitiveModelRepository();
    this.cognitiveProposalRepository = RepositoryFactory.createCognitiveProposalRepository();
    this.eventBus = eventBus;
  }
  
  /**
   * 执行更新认知模型用例
   * @param proposalId 认知建议ID
   * @returns 更新后的认知模型
   */
  public async execute(proposalId: string): Promise<UserCognitiveModel> {
    // 1. 查找认知建议
    const proposal = await this.cognitiveProposalRepository.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with id ${proposalId} not found`);
    }
    
    // 2. 查找或创建用户认知模型
    let model = await this.cognitiveModelRepository.findByUserId('user-1');
    if (!model) {
      // 创建新模型
      model = {
        id: `model-${Date.now()}`,
        userId: 'user-1',
        concepts: [],
        relations: [],
        evolutionHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // 3. 应用建议到模型（简化实现）
    // 实际应用中，这里需要更复杂的逻辑来验证和应用建议
    model.updatedAt = new Date();
    
    // 4. 保存更新后的模型
    const updatedModel = await this.cognitiveModelRepository.save(model);
    
    // 5. 发布事件
    const event: CognitiveModelUpdatedEvent = {
      modelId: updatedModel.id,
      userId: updatedModel.userId,
      timestamp: new Date(),
      changes: { proposalId }
    };
    this.eventBus.publish(EventType.COGNITIVE_MODEL_UPDATED, event);
    
    return updatedModel;
  }
}
```

## 7. 总结

Day 16的核心任务是实现各种Repository接口，包括：

1. **认知模型仓库**：实现了认知模型的保存、查询和更新功能，支持概念和关系的关联存储
2. **认知建议仓库**：实现了认知建议的保存和查询功能，支持概念候选和关系候选的存储
3. **认知洞察仓库**：实现了认知洞察的保存和查询功能
4. **事件系统**：实现了事件总线和事件处理机制，支持事件的发布和订阅
5. **日志系统**：实现了基本的日志记录功能，支持不同级别的日志输出

通过Day 16的开发，我们成功实现了Infrastructure层的核心功能，为Application层提供了必要的支持。在后续的开发中，我们将继续完善Infrastructure层的功能，包括事件处理、日志管理和错误处理等，同时开始系统的集成测试和优化工作。