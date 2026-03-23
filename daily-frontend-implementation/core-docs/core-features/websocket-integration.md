# WebSocket集成设计

## 模块关联索引

### 所属环节
- **阶段**：第七阶段：WebSocket实时通信模块
- **周次**：第9周
- **天数**：第25-27天
- **开发主题**：WebSocket连接实现、WebSocket事件处理、WebSocket优化和测试

### 对应文档
- [第25天：WebSocket连接实现](../../phase-7-websocket/week-9-websocket/25-websocket-connection-技术实现.md)
- [第26天：WebSocket事件处理](../../phase-7-websocket/week-9-websocket/26-websocket-event-handling-技术实现.md)
- [第27天：WebSocket优化和测试](../../phase-7-websocket/week-9-websocket/27-websocket-optimization-and-testing-技术实现.md)

### 相关核心文档
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [API集成规范](api-integration-spec.md)

### 关联模块
- [API集成规范](api-integration-spec.md)
- [API文档](api-documentation.md)

### 依赖关系
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [API集成规范](api-integration-spec.md)

## 1. 概述

WebSocket是AI Voice Interaction App与后端进行实时通信的核心技术，用于实现认知模型更新、分析结果推送等实时功能。本文档定义了WebSocket的集成设计，包括连接管理、事件处理、错误处理等。

## 2. 技术栈

- **WebSocket API**：URLSessionWebSocketTask（Apple官方WebSocket API）
- **状态管理**：SwiftUI ObservableObject + Environment
- **并发处理**：Swift Concurrency（async/await）

## 3. 连接管理

### 3.1 WebSocket URL配置

| 环境 | URL |
|------|-----|
| 开发环境 | `ws://localhost:3000/ws` |
| 测试环境 | `wss://test-api.example.com/ws` |
| 生产环境 | `wss://api.example.com/ws` |

### 3.2 连接流程

1. 应用启动时，初始化WebSocket客户端
2. 建立WebSocket连接
3. 发送认证信息
4. 启动心跳机制
5. 监听WebSocket事件
6. 应用退出时，关闭WebSocket连接

### 3.3 自动重连机制

- **重连条件**：连接断开、认证失败、网络异常
- **重连策略**：指数退避算法，初始延迟1秒，最大延迟30秒
- **重连次数**：无限重试，直到连接成功

### 3.4 心跳机制

- **心跳间隔**：30秒
- **心跳请求**：发送`ping`事件
- **心跳响应**：接收`pong`事件
- **超时处理**：超过60秒未收到`pong`响应，认为连接断开，触发重连

## 4. 事件处理

### 4.1 事件类型

#### 4.1.1 客户端事件

| 事件类型 | 描述 | 数据格式 |
|----------|------|----------|
| `auth` | 认证事件，用于WebSocket连接认证 | `{ "token": "JWT Token" }` |
| `ping` | 心跳事件，用于保持连接活跃 | 无 |

#### 4.1.2 服务端事件

| 事件类型 | 描述 | 数据格式 |
|----------|------|----------|
| `pong` | 心跳响应事件 | 无 |
| `model_updated` | 认知模型更新事件 | `{ "modelId": "string", "updates": { "concepts": [], "relations": [] } }` |
| `analysis_result` | 分析结果推送事件 | `{ "modelId": "string", "analysisId": "string", "result": {} }` |
| `error` | 错误事件 | `{ "code": "string", "message": "string" }` |

### 4.2 事件处理流程

1. WebSocket客户端接收服务端事件
2. 解析事件类型和数据
3. 根据事件类型调用相应的处理函数
4. 更新应用状态或触发UI更新
5. 记录事件日志

## 5. 核心实现

### 5.1 WebSocket客户端类

```swift
/// WebSocket客户端
class WebSocketClient: ObservableObject {
    /// 连接状态
    @Published var connectionState: WebSocketConnectionState = .disconnected
    
    /// WebSocket任务
    private var webSocketTask: URLSessionWebSocketTask?
    
    /// 重连定时器
    private var reconnectTimer: Timer?
    
    /// 心跳定时器
    private var heartbeatTimer: Timer?
    
    /// 重连延迟
    private var reconnectDelay: TimeInterval = 1.0
    
    /// 最大重连延迟
    private let maxReconnectDelay: TimeInterval = 30.0
    
    /// 心跳间隔
    private let heartbeatInterval: TimeInterval = 30.0
    
    /// 初始化WebSocket客户端
    init() {
        // 初始化URLSession
    }
    
    /// 连接到WebSocket服务器
    func connect() {
        // 建立WebSocket连接
    }
    
    /// 断开WebSocket连接
    func disconnect() {
        // 关闭WebSocket连接
    }
    
    /// 发送事件
    func sendEvent(type: String, data: [String: Any]? = nil) {
        // 发送WebSocket事件
    }
    
    /// 处理接收到的事件
    private func handleEvent(type: String, data: [String: Any]?) {
        // 处理不同类型的事件
    }
    
    /// 启动自动重连
    private func startReconnectTimer() {
        // 启动重连定时器
    }
    
    /// 停止自动重连
    private func stopReconnectTimer() {
        // 停止重连定时器
    }
    
    /// 启动心跳
    private func startHeartbeat() {
        // 启动心跳定时器
    }
    
    /// 停止心跳
    private func stopHeartbeat() {
        // 停止心跳定时器
    }
}

/// WebSocket连接状态
enum WebSocketConnectionState {
    case disconnected
    case connecting
    case connected
    case reconnecting
}
```

### 5.2 事件订阅机制

```swift
/// WebSocket事件监听器
protocol WebSocketEventListener {
    /// 处理认知模型更新事件
    func onModelUpdated(modelId: String, updates: [String: Any])
    
    /// 处理分析结果推送事件
    func onAnalysisResult(modelId: String, analysisId: String, result: [String: Any])
    
    /// 处理错误事件
    func onError(code: String, message: String)
    
    /// 处理连接状态变化
    func onConnectionStateChanged(state: WebSocketConnectionState)
}

/// WebSocket事件管理器
class WebSocketEventManager {
    /// 事件监听器列表
    private var listeners: [WebSocketEventListener] = []
    
    /// 添加事件监听器
    func addListener(_ listener: WebSocketEventListener) {
        listeners.append(listener)
    }
    
    /// 移除事件监听器
    func removeListener(_ listener: WebSocketEventListener) {
        listeners.removeAll { $0 === listener }
    }
    
    /// 触发认知模型更新事件
    func triggerModelUpdated(modelId: String, updates: [String: Any]) {
        listeners.forEach { $0.onModelUpdated(modelId: modelId, updates: updates) }
    }
    
    /// 触发分析结果推送事件
    func triggerAnalysisResult(modelId: String, analysisId: String, result: [String: Any]) {
        listeners.forEach { $0.onAnalysisResult(modelId: modelId, analysisId: analysisId, result: result) }
    }
    
    /// 触发错误事件
    func triggerError(code: String, message: String) {
        listeners.forEach { $0.onError(code: code, message: message) }
    }
    
    /// 触发连接状态变化事件
    func triggerConnectionStateChanged(state: WebSocketConnectionState) {
        listeners.forEach { $0.onConnectionStateChanged(state: state) }
    }
}
```

## 6. 错误处理

### 6.1 错误类型

| 错误类型 | 描述 | 处理方式 |
|----------|------|----------|
| 连接错误 | WebSocket连接失败 | 触发自动重连 |
| 认证错误 | WebSocket认证失败 | 重新获取Token并认证，失败则提示用户重新登录 |
| 网络错误 | 网络连接异常 | 触发自动重连，显示网络异常提示 |
| 数据错误 | 接收的数据格式无效 | 记录错误日志，忽略无效数据 |
| 超时错误 | 心跳超时 | 触发自动重连 |

### 6.2 错误处理流程

1. WebSocket客户端捕获错误
2. 记录错误日志
3. 根据错误类型采取相应的处理措施
4. 更新连接状态
5. 通知相关组件错误信息
6. 向用户显示友好的错误提示

## 7. 安全考虑

### 7.1 认证安全
- 使用JWT Token进行WebSocket认证
- Token定期刷新，避免长期有效
- 认证失败时，及时关闭连接

### 7.2 数据安全
- 使用WSS协议（WebSocket over TLS）加密传输数据
- 验证接收到的数据格式，防止注入攻击
- 敏感数据在客户端加密存储

### 7.3 防止滥用
- 限制WebSocket连接频率
- 实现消息限流，防止消息轰炸
- 监控异常连接行为

## 8. 性能优化

### 8.1 连接优化
- 减少不必要的连接建立和断开
- 实现连接池，复用WebSocket连接
- 合理设置心跳间隔，避免频繁心跳

### 8.2 数据优化
- 压缩传输数据，减少带宽消耗
- 只传输必要的数据字段，避免数据冗余
- 批量处理消息，减少消息数量

### 8.3 并发优化
- 使用异步/等待语法处理WebSocket事件
- 避免在主线程处理大量数据
- 使用合适的并发队列处理不同类型的事件

## 9. 测试策略

### 9.1 单元测试

#### 9.1.1 连接管理测试

**测试用例1：WebSocket连接建立**
- **测试目标**：验证WebSocket客户端能够成功建立连接
- **测试步骤**：
  1. 创建WebSocketClient实例
  2. 调用connect()方法
  3. 验证连接状态变为connected
- **预期结果**：连接状态变为connected，无错误抛出

**测试用例2：WebSocket连接断开**
- **测试目标**：验证WebSocket客户端能够成功断开连接
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 调用disconnect()方法
  3. 验证连接状态变为disconnected
- **预期结果**：连接状态变为disconnected，无错误抛出

#### 9.1.2 自动重连机制测试

**测试用例1：网络断开后自动重连**
- **测试目标**：验证WebSocket客户端在网络断开后能够自动重连
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 模拟网络断开
  3. 验证连接状态变为reconnecting
  4. 模拟网络恢复
  5. 验证连接状态恢复为connected
- **预期结果**：客户端能够自动重连，连接状态正确变化

**测试用例2：重连延迟指数退避**
- **测试目标**：验证WebSocket客户端重连延迟符合指数退避算法
- **测试步骤**：
  1. 创建WebSocketClient实例
  2. 模拟多次连接失败
  3. 验证重连延迟逐渐增加，直到达到最大延迟
- **预期结果**：重连延迟按照指数退避算法增加，最大延迟不超过30秒

#### 9.1.3 心跳机制测试

**测试用例1：心跳发送与接收**
- **测试目标**：验证WebSocket客户端能够正确发送心跳并接收响应
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 等待心跳发送（30秒）
  3. 验证客户端发送了ping事件
  4. 模拟服务端返回pong事件
  5. 验证客户端接收到pong事件
- **预期结果**：客户端能够正确发送ping并接收pong，无超时

**测试用例2：心跳超时处理**
- **测试目标**：验证WebSocket客户端在心跳超时后能够触发重连
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 等待心跳发送
  3. 模拟服务端不返回pong事件
  4. 等待60秒
  5. 验证客户端触发重连
- **预期结果**：客户端在心跳超时后触发重连

#### 9.1.4 事件处理测试

**测试用例1：模型更新事件处理**
- **测试目标**：验证WebSocket客户端能够正确处理model_updated事件
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 注册事件监听器
  3. 模拟服务端发送model_updated事件
  4. 验证监听器收到正确的事件数据
- **预期结果**：监听器能够收到正确的model_updated事件数据

**测试用例2：分析结果事件处理**
- **测试目标**：验证WebSocket客户端能够正确处理analysis_result事件
- **测试步骤**：
  1. 创建WebSocketClient实例并建立连接
  2. 注册事件监听器
  3. 模拟服务端发送analysis_result事件
  4. 验证监听器收到正确的事件数据
- **预期结果**：监听器能够收到正确的analysis_result事件数据

### 9.2 集成测试

#### 9.2.1 端到端测试

**测试用例1：实时模型更新**
- **测试目标**：验证后端更新模型后，前端能够实时收到更新
- **测试步骤**：
  1. 启动后端服务
  2. 启动前端应用
  3. 建立WebSocket连接
  4. 通过后端API更新认知模型
  5. 验证前端收到model_updated事件
  6. 验证前端UI正确更新
- **预期结果**：前端能够实时收到模型更新，UI正确反映更新内容

**测试用例2：分析结果推送**
- **测试目标**：验证后端生成分析结果后，前端能够实时收到推送
- **测试步骤**：
  1. 启动后端服务
  2. 启动前端应用
  3. 建立WebSocket连接
  4. 提交分析任务
  5. 等待后端生成分析结果
  6. 验证前端收到analysis_result事件
  7. 验证前端显示分析结果
- **预期结果**：前端能够实时收到分析结果推送，正确显示结果

#### 9.2.2 异常情况测试

**测试用例1：后端服务重启**
- **测试目标**：验证后端服务重启后，前端WebSocket能够自动重连
- **测试步骤**：
  1. 启动后端服务
  2. 启动前端应用
  3. 建立WebSocket连接
  4. 重启后端服务
  5. 验证前端WebSocket自动重连
  6. 验证重连后能够正常接收事件
- **预期结果**：前端WebSocket能够自动重连，重连后功能正常

**测试用例2：网络切换**
- **测试目标**：验证网络切换时，前端WebSocket能够保持连接或自动重连
- **测试步骤**：
  1. 启动前端应用
  2. 建立WebSocket连接
  3. 切换网络（如从WiFi到蜂窝网络）
  4. 验证WebSocket连接状态
  5. 验证能够正常发送和接收事件
- **预期结果**：网络切换后，WebSocket能够保持连接或自动重连，功能正常

### 9.3 性能测试

#### 9.3.1 连接性能测试

**测试用例1：连接建立时间**
- **测试目标**：测试WebSocket连接建立的平均时间
- **测试步骤**：
  1. 创建WebSocketClient实例
  2. 重复建立连接100次
  3. 记录每次连接建立的时间
  4. 计算平均连接时间
- **预期结果**：平均连接时间小于500ms

**测试用例2：并发连接数**
- **测试目标**：测试单个设备能够支持的最大WebSocket连接数
- **测试步骤**：
  1. 创建多个WebSocketClient实例
  2. 同时建立连接
  3. 记录成功建立的连接数
  4. 测试不同数量的并发连接
- **预期结果**：至少能够支持10个并发连接

#### 9.3.2 消息性能测试

**测试用例1：消息延迟**
- **测试目标**：测试WebSocket消息的平均延迟
- **测试步骤**：
  1. 建立WebSocket连接
  2. 发送测试消息，记录发送时间
  3. 记录收到响应的时间
  4. 计算消息延迟
  5. 重复100次，计算平均延迟
- **预期结果**：平均消息延迟小于100ms

**测试用例2：消息吞吐量**
- **测试目标**：测试WebSocket的消息处理能力
- **测试步骤**：
  1. 建立WebSocket连接
  2. 在1秒内发送大量消息
  3. 记录成功处理的消息数
- **预期结果**：能够处理至少100条消息/秒

#### 9.3.3 稳定性测试

**测试用例1：长时间运行**
- **测试目标**：测试WebSocket连接的长时间稳定性
- **测试步骤**：
  1. 建立WebSocket连接
  2. 保持连接运行24小时
  3. 定期发送心跳和测试消息
  4. 记录连接状态和错误情况
- **预期结果**：连接能够稳定运行24小时，无频繁断开和重连

**测试用例2：大量消息处理**
- **测试目标**：测试WebSocket处理大量消息的稳定性
- **测试步骤**：
  1. 建立WebSocket连接
  2. 连续发送1000条消息
  3. 记录处理结果和错误情况
- **预期结果**：能够成功处理所有消息，无崩溃或内存泄漏

## 10. 监控与日志

### 10.1 监控策略

#### 10.1.1 实时监控

- **连接状态监控**：实时监控WebSocket连接状态，包括连接数、断开率、重连次数
- **消息监控**：监控消息发送和接收的数量、延迟、错误率
- **性能监控**：监控连接建立时间、消息处理时间、内存使用情况

#### 10.1.2 监控工具

- **Firebase Performance Monitoring**：监控网络性能和应用性能
- **New Relic Mobile**：实时监控应用性能和错误
- **自建监控系统**：使用Prometheus + Grafana构建自定义监控系统

#### 10.1.3 告警机制

- **连接告警**：当连接断开率超过阈值时触发告警
- **延迟告警**：当消息延迟超过阈值时触发告警
- **错误告警**：当错误率超过阈值时触发告警
- **重连告警**：当重连次数超过阈值时触发告警

### 10.2 日志策略

#### 10.2.1 日志级别

- **DEBUG**：详细的调试信息，包括连接状态变化、消息内容等
- **INFO**：正常的运行信息，如连接建立、断开、心跳事件等
- **WARNING**：警告信息，如重连尝试、消息解析错误等
- **ERROR**：错误信息，如连接失败、认证失败等

#### 10.2.2 日志内容

- **连接日志**：记录连接建立、断开、重连尝试等事件
- **消息日志**：记录发送和接收的事件类型、大小、时间等
- **错误日志**：记录错误类型、错误信息、发生时间、堆栈跟踪等
- **性能日志**：记录连接建立时间、消息延迟等性能指标

#### 10.2.3 日志存储

- **本地存储**：使用OSLog或第三方日志库（如CocoaLumberjack）存储本地日志
- **远程日志**：将重要日志发送到远程日志服务器（如Firebase Crashlytics、Loggly）
- **日志轮转**：实现日志轮转，避免日志文件过大

### 10.3 WebSocket连接稳定性测试

#### 10.3.1 测试方法

- **模拟网络抖动**：使用网络链接调节器模拟网络抖动
- **模拟高延迟**：使用网络链接调节器模拟高延迟网络
- **模拟丢包**：使用网络链接调节器模拟网络丢包
- **长时间运行测试**：在真实环境中运行应用24小时以上，监控WebSocket连接状态

#### 10.3.2 测试工具

- **Network Link Conditioner**：Apple官方提供的网络调试工具，用于模拟各种网络条件
- **Charles Proxy**：用于监控和修改网络请求，可模拟各种网络条件
- **Wireshark**：用于捕获和分析网络数据包

### 10.4 消息流量监控

#### 10.4.1 监控指标

- **消息数量**：每分钟发送和接收的消息数量
- **消息大小**：每条消息的平均大小
- **流量总量**：每分钟的总流量（发送和接收）
- **消息类型分布**：不同类型消息的分布情况

#### 10.4.2 优化策略

- **消息合并**：将多个小消息合并为一个大消息，减少消息数量
- **数据压缩**：对较大的消息进行压缩，减少流量
- **按需订阅**：实现基于兴趣的消息订阅，只接收需要的消息
- **消息优先级**：对消息设置优先级，优先处理重要消息

## 11. WebSocket连接稳定性优化

### 11.1 连接管理优化

- **连接池管理**：实现WebSocket连接池，复用连接资源
- **智能重连**：根据网络条件调整重连策略，如在网络不稳定时增加重连延迟
- **连接状态预测**：根据网络质量预测连接状态，提前准备重连

### 11.2 消息处理优化

- **异步消息处理**：使用异步队列处理消息，避免阻塞主线程
- **消息批处理**：将多个相关消息批处理，减少处理次数
- **消息缓存**：在网络不稳定时缓存消息，网络恢复后批量发送

### 11.3 错误恢复机制

- **消息重传**：实现消息确认机制，对未确认的消息进行重传
- **状态同步**：定期与服务器同步状态，确保数据一致性
- **优雅降级**：在WebSocket连接失败时，降级为HTTP轮询，确保基本功能可用

## 11. 相关文档

- [API集成规范](api-integration-spec.md) - 与后端API集成的规范
- [API文档](api-documentation.md) - 前后端API契约文档
