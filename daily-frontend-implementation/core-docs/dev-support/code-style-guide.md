# 代码规范

## 模块关联索引

### 所属环节
- **阶段**：全阶段
- **周次**：全周次
- **天数**：全天数
- **开发主题**：代码质量和规范

### 对应文档
- [第1天：项目初始化](../../phase-1-foundation/week-1-setup/01-project-initialization-技术实现.md)

### 相关核心文档
- [开发流程](development-process.md)
- [测试策略](../test-quality/test-strategy.md)

### 关联模块
- [开发流程](development-process.md)
- [测试策略](../test-quality/test-strategy.md)

### 依赖关系
- [开发流程](development-process.md)

## 1. 概述

本文档定义了AI Voice Interaction App前端项目的代码规范，旨在确保代码的一致性、可读性和可维护性。所有开发者都应遵循本规范编写代码。

## 2. 命名规范

### 2.1 类和结构体命名
- 使用大驼峰命名法（UpperCamelCase）
- 清晰描述类或结构体的用途
- **示例**：
  ```swift
  class VoiceInteractionService {
      // 实现代码
  }
  
  struct CognitiveConcept {
      // 实现代码
  }
  ```

### 2.2 函数和方法命名
- 使用小驼峰命名法（lowerCamelCase）
- 动词开头，清晰描述函数的功能
- 参数名也要清晰描述其用途
- **示例**：
  ```swift
  func startRecording() {
      // 实现代码
  }
  
  func getCognitiveModel(id: String) async throws -> CognitiveModel {
      // 实现代码
  }
  ```

### 2.3 属性和变量命名
- 使用小驼峰命名法（lowerCamelCase）
- 清晰描述属性或变量的用途
- 避免使用缩写，除非是广泛认可的缩写
- **示例**：
  ```swift
  let modelId: String
  var isRecording: Bool
  private var websocketTask: URLSessionWebSocketTask?
  ```

### 2.4 常量命名
- 使用大驼峰命名法（UpperCamelCase）
- 清晰描述常量的用途
- **示例**：
  ```swift
  let DefaultTimeout = TimeInterval(30)
  let MaxRetryCount = 3
  ```

### 2.5 枚举命名
- 枚举类型使用大驼峰命名法（UpperCamelCase）
- 枚举成员使用大驼峰命名法（UpperCamelCase）
- **示例**：
  ```swift
  enum RecordingState {
      case idle
      case recording
      case processing
      case completed
  }
  ```

### 2.6 协议命名
- 使用大驼峰命名法（UpperCamelCase）
- 以"Protocol"结尾，或使用形容词形式
- **示例**：
  ```swift
  protocol VoiceRecognitionProtocol {
      // 协议定义
  }
  
  protocol Observable {
      // 协议定义
  }
  ```

## 3. 代码格式

### 3.1 缩进
- 使用4个空格进行缩进，不要使用制表符（Tab）
- 确保整个项目的缩进一致

### 3.2 换行和空行
- 函数和方法之间空一行
- 类的属性和方法之间空一行
- 逻辑块之间空一行，提高可读性
- **示例**：
  ```swift
  class VoiceInteractionService {
      private let audioEngine = AVAudioEngine()
      private let speechRecognizer = SFSpeechRecognizer(locale: Locale.current)
      private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
      private var recognitionTask: SFSpeechRecognitionTask?
      
      func startRecording() throws {
          // 实现代码
      }
      
      func stopRecording() {
          // 实现代码
      }
  }
  ```

### 3.3 大括号
- 大括号与语句在同一行
- 闭合大括号单独一行
- **示例**：
  ```swift
  if isRecording {
      stopRecording()
  } else {
      try startRecording()
  }
  ```

### 3.4 空格
- 运算符两侧各加一个空格
- 逗号和分号后加一个空格
- 括号内侧不加空格
- **示例**：
  ```swift
  let result = a + b * c
  for item in items {
      // 实现代码
  }
  func processData(data: Data, completion: @escaping (Result<String, Error>) -> Void) {
      // 实现代码
  }
  ```

## 4. Swift特定规范

### 4.1 可选类型处理
- 优先使用可选绑定（optional binding）处理可选类型
- 避免使用强制解包（!），除非确实知道可选类型不为nil
- **示例**：
  ```swift
  // 推荐：使用可选绑定
  if let recognitionTask = recognitionTask {
      recognitionTask.cancel()
      self.recognitionTask = nil
  }
  
  // 不推荐：强制解包
  recognitionTask!.cancel()
  ```

### 4.2 空值合并运算符
- 使用??运算符处理可选类型的默认值
- **示例**：
  ```swift
  let name = user.name ?? "Unknown"
  ```

### 4.3 类型推断
- 优先使用类型推断，除非明确需要指定类型
- **示例**：
  ```swift
  // 推荐：使用类型推断
  let modelId = "12345"
  let isRecording = false
  
  // 不推荐：不必要的类型标注
  let modelId: String = "12345"
  let isRecording: Bool = false
  ```

### 4.4 结构体和类的选择
- 优先使用结构体，除非需要继承或引用语义
- **示例**：
  ```swift
  // 推荐：使用结构体表示值类型
  struct CognitiveConcept {
      let id: String
      let name: String
      let description: String?
  }
  
  // 推荐：使用类表示引用类型
  class VoiceInteractionService {
      // 需要引用语义，使用类
  }
  ```

### 4.5 异步/等待
- 使用async/await语法处理异步操作
- 避免使用回调地狱
- **示例**：
  ```swift
  // 推荐：使用async/await
  func fetchCognitiveModel(id: String) async throws -> CognitiveModel {
      let url = URL(string: "baseURL)/cognitive-models/id)")!
      let (data, response) = try await URLSession.shared.data(from: url)
      // 处理响应
      return try JSONDecoder().decode(CognitiveModel.self, from: data)
  }
  
  // 不推荐：回调地狱
  func fetchCognitiveModel(id: String, completion: @escaping (Result<CognitiveModel, Error>) -> Void) {
      let url = URL(string: "baseURL)/cognitive-models/id)")!
      URLSession.shared.dataTask(with: url) { data, response, error in
          if let error = error {
              completion(.failure(error))
              return
          }
          guard let data = data else {
              completion(.failure(NetworkError.noData))
              return
          }
          do {
              let model = try JSONDecoder().decode(CognitiveModel.self, from: data)
              completion(.success(model))
          } catch {
              completion(.failure(error))
          }
      }.resume()
  }
  ```

## 5. SwiftUI规范

### 5.1 视图结构
- 保持视图简洁，每个视图只负责一个功能
- 使用组合视图构建复杂界面
- **示例**：
  ```swift
  struct VoiceInteractionView: View {
      @StateObject private var viewModel = VoiceInteractionViewModel()
      
      var body: some View {
          VStack {
              VoiceInputComponent(isRecording: $viewModel.isRecording)
              ConversationList(messages: $viewModel.messages)
              AnalysisResultsView(results: $viewModel.analysisResults)
          }
      }
  }
  ```

### 5.2 状态管理
- 使用@State管理组件内部状态
- 使用@ObservableObject管理跨组件状态
- 使用@EnvironmentObject管理全局状态
- **示例**：
  ```swift
  struct VoiceInputComponent: View {
      @Binding var isRecording: Bool
      
      var body: some View {
          Button(action: {
              isRecording.toggle()
          }) {
              Image(systemName: isRecording ? "mic.slash.fill" : "mic.fill")
                  .resizable()
                  .frame(width: 48, height: 48)
                  .foregroundColor(isRecording ? .red : .blue)
          }
      }
  }
  ```

### 5.3 修饰符顺序
- 遵循一致的修饰符顺序：
  1. 布局修饰符（padding, frame, position等）
  2. 样式修饰符（foregroundColor, backgroundColor等）
  3. 交互修饰符（onTapGesture, disabled等）
  4. 其他修饰符（animation, transition等）
- **示例**：
  ```swift
  Button("Start Recording") {
      // 实现代码
  }
  .padding(16)
  .frame(maxWidth: .infinity)
  .background(Color.blue)
  .foregroundColor(.white)
  .cornerRadius(8)
  .disabled(isRecording)
  .animation(.easeInOut)
  ```

## 6. 注释规范

### 6.1 文档注释
- 为公共API添加文档注释
- 使用///语法
- 描述API的功能、参数、返回值和抛出的错误
- **示例**：
  ```swift
  /// 语音交互服务
  /// 
  /// 负责处理语音输入和输出，与后端进行语音相关的通信
  class VoiceInteractionService {
      /// 开始录音
      /// 
      /// 启动语音识别，将用户的语音转换为文本
      /// 
      /// - Throws: 当无法访问麦克风或语音识别服务不可用时抛出错误
      func startRecording() throws {
          // 实现代码
      }
      
      /// 停止录音
      /// 
      /// 停止语音识别，并返回识别的文本
      /// 
      /// - Returns: 识别的文本内容
      func stopRecording() -> String {
          // 实现代码
      }
  }
  ```

### 6.2 解释性注释
- 为复杂的逻辑或算法添加解释性注释
- 说明代码的意图，而不是单纯描述代码
- 避免不必要的注释
- **示例**：
  ```swift
  // 使用力导向图算法计算节点位置
  // 节点之间的斥力与距离的平方成反比
  // 节点之间的引力与距离成正比
  func calculateNodePositions() {
      for i in 0..<nodes.count {
          for j in i+1..<nodes.count {
              // 计算斥力
              let repulsion = calculateRepulsion(node1: nodes[i], node2: nodes[j])
              // 计算引力
              let attraction = calculateAttraction(node1: nodes[i], node2: nodes[j])
              // 更新节点位置
              updateNodePosition(node: nodes[i], force: repulsion + attraction)
              updateNodePosition(node: nodes[j], force: -repulsion - attraction)
          }
      }
  }
  ```

## 7. 代码组织

### 7.1 文件结构
- 每个文件只包含一个主要的类、结构体或枚举
- 文件名为类、结构体或枚举的名称
- 相关的扩展可以放在同一个文件中
- **示例**：
  ```
  VoiceInteractionService.swift
  - 包含VoiceInteractionService类
  - 包含VoiceInteractionService的相关扩展
  ```

### 7.2 导入语句
- 按照以下顺序组织导入语句：
  1. 系统框架导入
  2. 第三方库导入
  3. 项目内部导入
- 使用sorted_imports规则自动排序
- **示例**：
  ```swift
  import SwiftUI
  import Combine
  import Speech
  
  import Alamofire
  import SwiftyJSON
  
  import AI_Voice_Interaction_App
  ```

### 7.3 扩展使用
- 使用扩展组织相关功能
- 为类或结构体添加协议实现
- 为类或结构体添加辅助方法
- **示例**：
  ```swift
  struct CognitiveModel {
      let id: String
      let name: String
      let concepts: [CognitiveConcept]
      let relations: [CognitiveRelation]
  }
  
  extension CognitiveModel {
      func findConceptById(id: String) -> CognitiveConcept? {
          return concepts.first { $0.id == id }
      }
      
      func findRelationsByConceptId(id: String) -> [CognitiveRelation] {
          return relations.filter { $0.sourceId == id || $0.targetId == id }
      }
  }
  
  extension CognitiveModel: Codable {
      // Codable协议实现
  }
  ```

## 8. 错误处理

### 8.1 自定义错误类型
- 定义清晰的自定义错误类型
- 使用枚举实现Error协议
- **示例**：
  ```swift
  enum NetworkError: Error {
      case invalidURL
      case noData
      case decodingError
      case serverError(statusCode: Int)
      case unknown(Error)
  }
  ```

### 8.2 错误传播
- 使用throws关键字传播错误
- 避免在底层捕获并忽略错误
- **示例**：
  ```swift
  func fetchData(url: URL) async throws -> Data {
      let (data, response) = try await URLSession.shared.data(from: url)
      
      guard let httpResponse = response as? HTTPURLResponse else {
          throw NetworkError.invalidURL
      }
      
      guard (200...299).contains(httpResponse.statusCode) else {
          throw NetworkError.serverError(statusCode: httpResponse.statusCode)
      }
      
      return data
  }
  ```

### 8.3 错误捕获
- 在适当的层级捕获和处理错误
- 向用户显示友好的错误信息
- 记录错误日志
- **示例**：
  ```swift
  do {
      let data = try await fetchData(url: url)
      let model = try JSONDecoder().decode(CognitiveModel.self, from: data)
      // 处理成功情况
  } catch let error as NetworkError {
      switch error {
      case .invalidURL:
          showError("Invalid URL")
      case .noData:
          showError("No data received")
      case .decodingError:
          showError("Failed to parse data")
      case .serverError(let statusCode):
          showError("Server error: statusCode)")
      case .unknown(let error):
          showError("An unknown error occurred")
          logError(error)
      }
  } catch {
      showError("An unexpected error occurred")
      logError(error)
  }
  ```

## 9. 性能优化

### 9.1 避免不必要的重渲染
- 使用@StateObject而不是@ObservedObject来避免不必要的重渲染
- 使用Equatable协议和id修饰符优化列表渲染
- **示例**：
  ```swift
  struct ConversationList: View {
      @ObservedObject var viewModel: ConversationViewModel
      
      var body: some View {
          List(viewModel.messages, id: \.id) { message in
              MessageBubble(message: message)
          }
      }
  }
  
  struct MessageBubble: View, Equatable {
      let message: Message
      
      static func == (lhs: MessageBubble, rhs: MessageBubble) -> Bool {
          return lhs.message.id == rhs.message.id
      }
      
      var body: some View {
          // 实现代码
      }
  }
  ```

### 9.2 懒加载
- 使用LazyVStack和LazyHStack处理大量数据
- 使用@State属性延迟加载数据
- **示例**：
  ```swift
  struct CognitiveConceptList: View {
      @ObservedObject var viewModel: CognitiveModelViewModel
      
      var body: some View {
          ScrollView {
              LazyVStack {
                  ForEach(viewModel.concepts) { concept in
                      CognitiveConceptCard(concept: concept)
                  }
              }
          }
      }
  }
  ```

### 9.3 异步处理
- 使用async/await处理耗时操作
- 在后台线程处理数据密集型任务
- **示例**：
  ```swift
  func processLargeData(data: Data) async -> Result<[CognitiveConcept], Error> {
      return await withCheckedContinuation { continuation in
          DispatchQueue.global(qos: .background).async {
              do {
                  let concepts = try parseLargeData(data: data)
                  continuation.resume(returning: .success(concepts))
              } catch {
                  continuation.resume(returning: .failure(error))
              }
          }
      }
  }
  ```

## 10. 工具支持

### 10.1 SwiftLint
- 项目集成了SwiftLint，用于自动检查代码规范
- 配置文件：`.swiftlint.yml`
- 运行以下命令手动检查代码：
  ```bash
  swiftlint
  ```

### 10.2 Xcode格式化
- 使用Xcode的自动格式化功能：Control+I
- 确保Xcode的格式化设置与本规范一致

## 11. 最佳实践

- 保持代码简洁，避免过度设计
- 遵循单一职责原则，每个类或函数只负责一个功能
- 优先使用值类型（结构体），避免不必要的引用类型（类）
- 使用Swift的现代特性，如async/await、Result类型等
- 编写可测试的代码，便于单元测试
- 定期进行代码审查，确保代码质量

## 12. 相关文档

- [开发流程](development-process.md) - 前端开发流程和规范
- [第三方库使用规范](third-party-library-guidelines.md) - 第三方库的使用规范
