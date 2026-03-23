# WebSocket服务设计文档
#表示层 #WebSocket #实时通信 #事件驱动 #可视化

## 1. 文档概述

本文档详细描述了认知辅助系统WebSocket服务的设计和实现，包括WebSocket服务器配置、事件处理、实时数据推送等功能。WebSocket服务用于实现认知模型可视化数据的实时更新，提升用户体验。

WebSocket服务设计遵循Clean Architecture原则，依赖于应用层，而不直接依赖于领域层或基础设施层，确保了系统的可测试性和可维护性。

### 1.1 相关文档

- [前端集成设计](../core-features/frontend-integration-design.md) - 详细描述前端集成和可视化实现
- [API设计](../core-features/api-design.md) - 详细描述API的设计和实现
- [表示层设计](presentation-layer-design.md) - 详细描述表示层的设计
- [多维度分析设计](../core-features/multi-dimensional-analysis-design.md) - 详细描述多维度分析的设计

## 2. 设计原则

### 2.1 核心设计理念

- **实时性优先**：确保认知模型数据的实时更新和推送
- **松耦合**：WebSocket服务与业务逻辑解耦，通过事件驱动架构通信
- **可扩展性**：支持多种实时事件类型，便于未来扩展
- **安全性**：实现WebSocket连接的认证和授权
- **可靠性**：确保消息的可靠传递和连接的稳定管理

### 2.2 设计目标

1. **实时数据推送**：实现认知模型可视化数据的实时更新
2. **双向通信**：支持客户端与服务器之间的双向通信
3. **连接管理**：高效管理WebSocket连接，包括认证、授权和断开处理
4. **事件驱动**：基于事件驱动架构，支持多种事件类型
5. **可测试性**：设计便于单元测试和集成测试的组件
6. **高可用性**：确保WebSocket服务的高可用性和稳定性

## 3. WebSocket技术栈

| 组件类型 | 技术选型 | 用途 | 特点 |
|----------|----------|------|------|
| **WebSocket库** | @fastify/websocket | 构建WebSocket服务 | 与Fastify框架无缝集成，高性能 |
| **事件处理** | EventEmitter | 事件驱动架构 | Node.js内置，轻量级 |
| **认证授权** | JWT | WebSocket连接认证 | 与HTTP API认证机制一致 |
| **消息序列化** | JSON | 消息格式 | 轻量级，易于解析 |
| **连接管理** | Map | 连接存储 | 高效的连接查找和管理 |

## 4. 组件设计

### 4.1 WebSocket服务器配置

```typescript
import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { WebSocketController } from './WebSocketController';
import { AuthMiddleware } from '../presentation/middlewares/AuthMiddleware';
import { EventEmitter } from 'events';

interface WebSocketServerOptions {
  port: number;
  host: string;
  jwtSecret: string;
  eventEmitter: EventEmitter;
}

export class WebSocketServer {
  private fastify: ReturnType<typeof fastify>;
  private webSocketController: WebSocketController;
  private authMiddleware: AuthMiddleware;
  private eventEmitter: EventEmitter;

  constructor(options: WebSocketServerOptions) {
    this.fastify = fastify();
    this.eventEmitter = options.eventEmitter;
    this.authMiddleware = new AuthMiddleware(options.jwtSecret);
    this.webSocketController = new WebSocketController(this.eventEmitter, options.jwtSecret);
  }

  async initialize(): Promise<void> {
    // 注册WebSocket插件
    await this.fastify.register(websocket);

    // 注册WebSocket路由
    this.registerRoutes();

    // 启动服务器
    await this.fastify.listen({
      port: options.port,
      host: options.host
    });

    console.log(`WebSocket server listening on ws://${options.host}:${options.port}`);
  }

  private registerRoutes(): void {
    // WebSocket连接端点
    this.fastify.register((instance, opts, done) => {
      instance.get('/ws', {
        websocket: true,
        preHandler: this.authMiddleware.authenticateWebSocket.bind(this.authMiddleware)
      }, this.webSocketController.handleConnection.bind(this.webSocketController));

      done();
    });
  }

  async close(): Promise<void> {
    await this.fastify.close();
  }
}
```

### 4.2 WebSocket控制器

WebSocket控制器负责处理WebSocket连接、消息接收和发送。

```typescript
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { WebSocketMessage } from './types/WebSocketMessage';
import { WebSocketEvent } from './types/WebSocketEvent';

interface ClientConnection {
  userId: string;
  socket: WebSocket;
  modelSubscriptions: Set<string>;
  joinedAt: Date;
}

export class WebSocketController {
  private connections: Map<string, ClientConnection>;
  private eventEmitter: EventEmitter;
  private jwtSecret: string;

  constructor(eventEmitter: EventEmitter, jwtSecret: string) {
    this.connections = new Map();
    this.eventEmitter = eventEmitter;
    this.jwtSecret = jwtSecret;
    this.setupEventListeners();
  }

  handleConnection(connection: WebSocket, request: any): void {
    const userId = request.user.id;
    const connectionId = `${userId}-${Date.now()}`;

    // 创建客户端连接对象
    const clientConnection: ClientConnection = {
      userId,
      socket: connection as WebSocket,
      modelSubscriptions: new Set(),
      joinedAt: new Date()
    };

    // 存储连接
    this.connections.set(connectionId, clientConnection);

    // 处理连接关闭
    connection.on('close', () => {
      this.handleConnectionClose(connectionId);
    });

    // 处理消息接收
    connection.on('message', (message: string) => {
      this.handleMessage(connectionId, message);
    });

    // 处理错误
    connection.on('error', (error: Error) => {
      console.error(`WebSocket error for connection ${connectionId}:`, error);
      this.handleConnectionClose(connectionId);
    });

    // 发送欢迎消息
    this.sendMessage(connectionId, {
      event: WebSocketEvent.CONNECTION_ESTABLISHED,
      data: {
        message: 'WebSocket connection established',
        connectionId,
        joinedAt: clientConnection.joinedAt
      }
    });
  }

  private handleConnectionClose(connectionId: string): void {
    this.connections.delete(connectionId);
    console.log(`WebSocket connection closed: ${connectionId}`);
  }

  private handleMessage(connectionId: string, message: string): void {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message);
      const clientConnection = this.connections.get(connectionId);

      if (!clientConnection) {
        return;
      }

      switch (parsedMessage.event) {
        case WebSocketEvent.AUTH:
          this.handleAuth(clientConnection, parsedMessage.data);
          break;
        case WebSocketEvent.SUBSCRIBE_MODEL:
          this.handleSubscribeModel(clientConnection, parsedMessage.data);
          break;
        case WebSocketEvent.UNSUBSCRIBE_MODEL:
          this.handleUnsubscribeModel(clientConnection, parsedMessage.data);
          break;
        case WebSocketEvent.PING:
          this.handlePing(clientConnection, parsedMessage.data);
          break;
        default:
          console.warn(`Unknown WebSocket event: ${parsedMessage.event}`);
      }
    } catch (error) {
      console.error(`Error handling WebSocket message:`, error);
    }
  }

  private handleAuth(client: ClientConnection, data: any): void {
    // 处理认证逻辑
    const { token } = data;
    if (token) {
      try {
        // 验证token
        const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
        client.userId = decoded.userId;
        
        // 发送认证成功响应
        this.sendMessageToClient(client, {
          event: WebSocketEvent.CONNECTION_ESTABLISHED,
          data: {
            message: 'WebSocket connection authenticated',
            connectionId: `${client.userId}-${Date.now()}`,
            joinedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`WebSocket authentication failed:`, error);
        // 关闭连接或发送错误消息
        client.socket.close(4001, 'Invalid authentication token');
      }
    }
  }

  private handleSubscribeModel(client: ClientConnection, data: any): void {
    const { modelId } = data;
    if (modelId) {
      client.modelSubscriptions.add(modelId);
      this.sendMessageToClient(client, {
        event: WebSocketEvent.SUBSCRIPTION_CONFIRMED,
        data: { modelId }
      });
    }
  }

  private handleUnsubscribeModel(client: ClientConnection, data: any): void {
    const { modelId } = data;
    if (modelId) {
      client.modelSubscriptions.delete(modelId);
      this.sendMessageToClient(client, {
        event: WebSocketEvent.UNSUBSCRIPTION_CONFIRMED,
        data: { modelId }
      });
    }
  }

  private handlePing(client: ClientConnection, data: any): void {
    this.sendMessageToClient(client, {
      event: WebSocketEvent.PONG,
      data: { timestamp: Date.now() }
    });
  }

  private setupEventListeners(): void {
    // 监听认知模型更新事件
    this.eventEmitter.on('cognitiveModel.updated', (data: any) => {
      this.broadcastToSubscribers(data.modelId, {
        event: WebSocketEvent.MODEL_UPDATED,
        data
      });
    });

    // 监听可视化数据更新事件
    this.eventEmitter.on('visualization.updated', (data: any) => {
      this.broadcastToSubscribers(data.modelId, {
        event: WebSocketEvent.VISUALIZATION_UPDATED,
        data
      });
    });

    // 监听AI任务完成事件
    this.eventEmitter.on('aiTask.completed', (data: any) => {
      this.broadcastToUser(data.userId, {
        event: WebSocketEvent.AI_TASK_COMPLETED,
        data
      });
    });
  }

  private broadcastToSubscribers(modelId: string, message: WebSocketMessage): void {
    for (const [connectionId, client] of this.connections.entries()) {
      if (client.modelSubscriptions.has(modelId)) {
        this.sendMessageToClient(client, message);
      }
    }
  }

  private broadcastToUser(userId: string, message: WebSocketMessage): void {
    for (const [connectionId, client] of this.connections.entries()) {
      if (client.userId === userId) {
        this.sendMessageToClient(client, message);
      }
    }
  }

  private sendMessageToClient(client: ClientConnection, message: WebSocketMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  sendMessage(connectionId: string, message: WebSocketMessage): void {
    const client = this.connections.get(connectionId);
    if (client) {
      this.sendMessageToClient(client, message);
    }
  }
}
```

### 4.3 WebSocket事件类型

```typescript
export enum WebSocketEvent {
  // 连接相关事件
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_CLOSED = 'connection_closed',
  
  // 认证事件
  AUTH = 'auth',
  
  // 订阅相关事件
  SUBSCRIBE_MODEL = 'subscribe_model',
  UNSUBSCRIBE_MODEL = 'unsubscribe_model',
  SUBSCRIPTION_CONFIRMED = 'subscription_confirmed',
  UNSUBSCRIPTION_CONFIRMED = 'unsubscription_confirmed',
  
  // 数据更新事件
  MODEL_UPDATED = 'model_updated',
  VISUALIZATION_UPDATED = 'visualization_updated',
  AI_TASK_COMPLETED = 'ai_task_completed',
  
  // 心跳事件
  PING = 'ping',
  PONG = 'pong'
}
```

### 4.4 WebSocket消息格式

```typescript
export interface WebSocketMessage {
  event: WebSocketEvent;
  data?: any;
  timestamp?: string;
}
```

### 4.5 WebSocket认证中间件

```typescript
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import jwt from 'jsonwebtoken';

export class AuthMiddleware {
  constructor(private readonly jwtSecret: string) {}

  async authenticateWebSocket(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction): Promise<void> {
    try {
      // 从查询参数或头信息中获取token
      const token = request.query?.token as string || 
                   request.headers.authorization?.replace('Bearer ', '') ||
                   request.cookies?.token;

      if (!token) {
        reply.code(401).send({ error: 'WebSocket authentication token is required' });
        done(new Error('WebSocket authentication token is required'));
        return;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      request.user = { id: decoded.userId };
      done();
    } catch (error) {
      reply.code(401).send({ error: 'Invalid or expired WebSocket token' });
      done(new Error('Invalid or expired WebSocket token'));
    }
  }
}
```

## 5. 实时事件设计

### 5.1 认知模型更新事件

当认知模型发生变化时，系统会触发`cognitiveModel.updated`事件，WebSocket服务会将更新推送给所有订阅了该模型的客户端。

**事件数据格式**：
```json
{
  "modelId": "model-123",
  "userId": "user-123",
  "updatedFields": ["concepts", "relations", "healthScore"],
  "timestamp": 1641705600000
}
```

### 5.2 可视化数据更新事件

当可视化数据发生变化时，系统会触发`visualization.updated`事件，WebSocket服务会将更新推送给所有订阅了该模型的客户端。

**事件数据格式**：
```json
{
  "modelId": "model-123",
  "visualizationType": "concept-map",
  "data": {
    "nodes": [...],
    "edges": [...],
    "metadata": {...}
  },
  "timestamp": 1641705600000
}
```

### 5.3 AI任务完成事件

当AI任务完成时，系统会触发`aiTask.completed`事件，WebSocket服务会将结果推送给对应的用户。

**事件数据格式**：
```json
{
  "taskId": "task-123",
  "userId": "user-123",
  "taskType": "cognitive_analysis",
  "status": "completed",
  "result": {...},
  "timestamp": 1641705600000
}
```

## 6. 连接管理

### 6.1 连接生命周期

1. **连接建立**：客户端通过`ws://localhost:3000/ws?token=xxx`连接到WebSocket服务器
2. **认证授权**：服务器验证客户端的JWT令牌
3. **连接确认**：服务器发送`CONNECTION_ESTABLISHED`事件给客户端
4. **订阅模型**：客户端发送`SUBSCRIBE_MODEL`事件订阅特定认知模型
5. **实时推送**：服务器向订阅了模型的客户端推送实时更新
6. **连接关闭**：客户端或服务器关闭连接，触发`CONNECTION_CLOSED`事件

### 6.2 连接状态管理

| 状态 | 描述 | 处理方式 |
|------|------|----------|
| `CONNECTING` | 连接正在建立 | 等待连接完成 |
| `OPEN` | 连接已建立 | 正常发送和接收消息 |
| `CLOSING` | 连接正在关闭 | 等待连接关闭 |
| `CLOSED` | 连接已关闭 | 清理连接资源 |

## 7. 安全性设计

### 7.1 认证与授权

- **JWT认证**：WebSocket连接使用与HTTP API相同的JWT认证机制
- **令牌验证**：服务器验证每个WebSocket连接的JWT令牌
- **权限检查**：确保用户只能订阅和访问自己的认知模型
- **最小权限原则**：每个WebSocket连接只能访问完成工作所需的最小资源

### 7.2 消息安全

- **消息验证**：验证所有收到的消息格式和内容
- **防注入攻击**：对消息内容进行安全过滤
- **消息加密**：在生产环境中使用WSS（WebSocket Secure）加密连接

### 7.3 连接安全

- **速率限制**：限制单个IP的WebSocket连接数量
- **超时处理**：设置连接超时，自动关闭空闲连接
- **心跳机制**：通过PING/PONG消息保持连接活跃
- **异常处理**：妥善处理连接异常，防止服务器崩溃

## 8. 性能优化

### 8.1 连接管理优化

- **高效存储**：使用Map数据结构存储连接，实现O(1)时间复杂度的连接查找
- **连接池**：根据服务器资源调整最大连接数
- **空闲连接清理**：定期清理长时间空闲的连接

### 8.2 消息处理优化

- **异步处理**：使用异步/await处理消息，避免阻塞事件循环
- **批量推送**：对相似消息进行批量处理和推送
- **消息压缩**：对大型消息进行压缩，减少网络传输开销
- **优先级队列**：对重要消息设置更高的优先级

### 8.3 事件处理优化

- **事件去重**：避免重复发送相同的事件
- **事件过滤**：根据客户端订阅情况过滤事件
- **事件缓冲区**：使用缓冲区处理突发的事件流量

## 9. 测试策略

### 9.1 单元测试

- **WebSocket控制器测试**：测试连接处理、消息处理和事件分发逻辑
- **认证中间件测试**：测试WebSocket连接认证逻辑
- **事件处理测试**：测试事件监听和处理逻辑

### 9.2 集成测试

- **WebSocket服务器集成测试**：测试WebSocket服务器的完整流程
- **与HTTP API集成测试**：测试WebSocket服务与HTTP API的协同工作
- **事件驱动集成测试**：测试事件驱动架构的完整性

### 9.3 端到端测试

- **连接测试**：测试WebSocket连接的建立和关闭
- **实时推送测试**：测试实时数据推送功能
- **压力测试**：测试WebSocket服务在高并发下的性能
- **安全性测试**：测试WebSocket服务的安全性

## 10. 实现步骤

### 10.1 阶段1：基础架构搭建

1. **安装依赖**：安装@fastify/websocket库
2. **创建WebSocket服务器**：实现WebSocketServer类
3. **配置WebSocket路由**：注册WebSocket端点
4. **实现认证中间件**：添加WebSocket连接认证

### 10.2 阶段2：核心功能实现

1. **实现WebSocket控制器**：处理连接、消息和事件
2. **定义事件类型**：创建WebSocketEvent枚举
3. **实现消息格式**：定义WebSocketMessage接口
4. **添加事件监听**：监听系统事件并推送

### 10.3 阶段3：高级功能实现

1. **实现连接管理**：添加连接状态管理和清理
2. **实现订阅机制**：支持模型订阅和取消订阅
3. **添加心跳机制**：实现PING/PONG消息
4. **优化性能**：添加消息压缩和批量推送

### 10.4 阶段4：测试与优化

1. **编写单元测试**：为WebSocket组件编写单元测试
2. **编写集成测试**：测试WebSocket服务的完整流程
3. **压力测试**：测试WebSocket服务在高并发下的性能
4. **安全测试**：测试WebSocket服务的安全性
5. **优化性能**：根据测试结果优化性能

## 11. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |