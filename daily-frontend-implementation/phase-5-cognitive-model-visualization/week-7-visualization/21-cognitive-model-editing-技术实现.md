# Day 21: 认知模型可视化编辑 - 技术实现文档

## 核心任务概述

实现认知模型的可视化编辑和更新功能，包括添加新节点和关系、编辑节点和关系属性、删除节点和关系，以及实现模型更新的API服务和实时同步。

## 技术实现细节

### 1. 可视化编辑界面实现

#### 1.1 编辑控制面板

```swift
struct VisualizationEditControlView: View {
    @Binding var isEditing: Bool
    @Binding var editMode: EditMode
    var onAddNode: () -> Void
    var onAddRelation: () -> Void
    var onEdit: () -> Void
    var onDelete: () -> Void
    var onSave: () -> Void
    var onCancel: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            // 编辑模式切换
            HStack(spacing: 8) {
                EditModeToggleButton(
                    editMode: $editMode,
                    targetMode: .node,
                    icon: "circle.fill",
                    label: "节点"
                )
                
                EditModeToggleButton(
                    editMode: $editMode,
                    targetMode: .relation,
                    icon: "arrow.forward",
                    label: "关系"
                )
                
                EditModeToggleButton(
                    editMode: $editMode,
                    targetMode: .select,
                    icon: "cursorarrow",
                    label: "选择"
                )
            }
            
            Divider()
            
            // 操作按钮
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    Button(action: onAddNode) {
                        Label("添加节点", systemImage: "plus.circle.fill")
                            .font(.caption)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(editMode != .node)
                    
                    Button(action: onAddRelation) {
                        Label("添加关系", systemImage: "link")
                            .font(.caption)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(editMode != .relation)
                }
                
                HStack(spacing: 8) {
                    Button(action: onEdit) {
                        Label("编辑", systemImage: "pencil")
                            .font(.caption)
                    }
                    .buttonStyle(SecondaryButtonStyle())
                    
                    Button(action: onDelete) {
                        Label("删除", systemImage: "trash")
                            .font(.caption)
                    }
                    .buttonStyle(DangerButtonStyle())
                }
            }
            
            Divider()
            
            // 保存和取消按钮
            HStack(spacing: 8) {
                Button(action: onCancel) {
                    Label("取消", systemImage: "xmark.circle")
                        .font(.caption)
                }
                .buttonStyle(SecondaryButtonStyle())
                
                Button(action: onSave) {
                    Label("保存", systemImage: "checkmark.circle")
                        .font(.caption)
                }
                .buttonStyle(PrimaryButtonStyle())
            }
        }
        .padding()
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(width: 200)
    }
    
    // 编辑模式切换按钮组件
    struct EditModeToggleButton<Mode: RawRepresentable & Hashable>: View {
        @Binding var editMode: Mode
        let targetMode: Mode
        let icon: String
        let label: String
        
        var body: some View {
            Button(action: { editMode = targetMode }) {
                HStack {
                    Image(systemName: icon)
                        .font(.system(size: 12))
                    Text(label)
                        .font(.caption2)
                }
                .foregroundColor(editMode == targetMode ? .appPrimary : .appTextSecondary)
                .padding(6)
                .background(editMode == targetMode ? .appPrimary.opacity(0.1) : .clear)
                .cornerRadius(6)
                .frame(maxWidth: .infinity)
            }
        }
    }
}
```

#### 1.2 节点编辑表单

```swift
struct NodeEditFormView: View {
    @ObservedObject var viewModel: NodeEditViewModel
    var onSave: () -> Void
    var onCancel: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack {
                Text(viewModel.isNew ? "添加节点" : "编辑节点")
                    .font(.headline)
                    .foregroundColor(.appTextPrimary)
                Spacer()
                Button(action: onCancel) {
                    Image(systemName: "xmark")
                        .foregroundColor(.appTextSecondary)
                }
            }
            
            // 表单内容
            Form {
                // 节点名称
                Section(header: Text("基本信息")) {
                    TextField("节点名称", text: $viewModel.nodeLabel)
                        .textFieldStyle(DefaultTextFieldStyle())
                        .font(.body)
                    
                    // 节点类型
                    Picker("节点类型", selection: $viewModel.nodeType) {
                        ForEach(VisualizationNodeType.allCases, id: \.self) {
                            type in
                            Text(type.displayName)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // 节点大小
                    HStack {
                        Text("节点大小")
                        Spacer()
                        Text(String(format: "%.0fpx", viewModel.nodeSize))
                            .foregroundColor(.appTextSecondary)
                    }
                    Slider(
                        value: $viewModel.nodeSize,
                        in: 20...100,
                        step: 5
                    )
                }
                
                // 高级设置
                Section(header: Text("高级设置")) {
                    // 节点层级
                    Picker("节点层级", selection: $viewModel.nodeLevel) {
                        ForEach(1...5, id: \.self) {
                            level in
                            Text("层级 \(level)")
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // 节点描述
                    TextField("节点描述", text: $viewModel.nodeDescription)
                        .textFieldStyle(DefaultTextFieldStyle())
                        .font(.body)
                        .lineLimit(3)
                }
            }
            .frame(height: 300)
            
            // 操作按钮
            HStack(spacing: 12) {
                Button(action: onCancel) {
                    Text("取消")
                        .font(.body)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(SecondaryButtonStyle())
                
                Button(action: {
                    viewModel.save()
                    onSave()
                }) {
                    Text("保存")
                        .font(.body)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(!viewModel.isValid)
            }
        }
        .padding()
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(width: 320)
    }
}

// 节点编辑ViewModel
class NodeEditViewModel: ObservableObject {
    // 基本属性
    @Published var isNew: Bool
    @Published var nodeId: String?
    @Published var nodeLabel: String = ""
    @Published var nodeType: VisualizationNodeType = .secondary
    @Published var nodeSize: CGFloat = 50
    @Published var nodeLevel: Int = 1
    @Published var nodeDescription: String = ""
    
    // 验证状态
    var isValid: Bool {
        !nodeLabel.isEmpty
    }
    
    // 初始化
    init(isNew: Bool, node: VisualizationNode? = nil) {
        self.isNew = isNew
        
        if let node = node {
            self.nodeId = node.id
            self.nodeLabel = node.label
            self.nodeType = node.type
            self.nodeSize = node.size
            self.nodeLevel = node.level
            self.nodeDescription = node.description
        }
    }
    
    // 保存节点
    func save() {
        // 保存逻辑将在ViewModel中实现
    }
}
```

#### 1.3 关系编辑表单

```swift
struct RelationEditFormView: View {
    @ObservedObject var viewModel: RelationEditViewModel
    var onSave: () -> Void
    var onCancel: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            HStack {
                Text(viewModel.isNew ? "添加关系" : "编辑关系")
                    .font(.headline)
                    .foregroundColor(.appTextPrimary)
                Spacer()
                Button(action: onCancel) {
                    Image(systemName: "xmark")
                        .foregroundColor(.appTextSecondary)
                }
            }
            
            // 表单内容
            Form {
                // 关系基本信息
                Section(header: Text("关系信息")) {
                    // 关系类型
                    Picker("关系类型", selection: $viewModel.relationType) {
                        ForEach(VisualizationEdgeType.allCases, id: \.self) {
                            type in
                            Text(type.displayName)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // 关系强度
                    HStack {
                        Text("关系强度")
                        Spacer()
                        Text(String(format: "%.1f", viewModel.relationStrength))
                            .foregroundColor(.appTextSecondary)
                    }
                    Slider(
                        value: $viewModel.relationStrength,
                        in: 1...10,
                        step: 0.5
                    )
                    
                    // 源节点和目标节点
                    if !viewModel.isNew {
                        HStack {
                            Text("源节点")
                            Spacer()
                            Text(viewModel.sourceNodeLabel)
                                .foregroundColor(.appTextSecondary)
                        }
                        
                        HStack {
                            Text("目标节点")
                            Spacer()
                            Text(viewModel.targetNodeLabel)
                                .foregroundColor(.appTextSecondary)
                        }
                    }
                }
                
                // 高级设置
                Section(header: Text("高级设置")) {
                    // 关系描述
                    TextField("关系描述", text: $viewModel.relationDescription)
                        .textFieldStyle(DefaultTextFieldStyle())
                        .font(.body)
                        .lineLimit(3)
                    
                    // 是否有方向
                    Toggle("有方向关系", isOn: $viewModel.isDirected)
                }
            }
            .frame(height: 300)
            
            // 操作按钮
            HStack(spacing: 12) {
                Button(action: onCancel) {
                    Text("取消")
                        .font(.body)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(SecondaryButtonStyle())
                
                Button(action: {
                    viewModel.save()
                    onSave()
                }) {
                    Text("保存")
                        .font(.body)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PrimaryButtonStyle())
            }
        }
        .padding()
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(width: 320)
    }
}

// 关系编辑ViewModel
class RelationEditViewModel: ObservableObject {
    // 基本属性
    @Published var isNew: Bool
    @Published var relationId: String?
    @Published var relationType: VisualizationEdgeType = .associative
    @Published var relationStrength: CGFloat = 5.0
    @Published var isDirected: Bool = true
    @Published var relationDescription: String = ""
    
    // 节点信息
    @Published var sourceNodeId: String?
    @Published var targetNodeId: String?
    @Published var sourceNodeLabel: String = ""
    @Published var targetNodeLabel: String = ""
    
    // 初始化
    init(isNew: Bool, edge: VisualizationEdge? = nil) {
        self.isNew = isNew
        
        if let edge = edge {
            self.relationId = edge.id
            self.relationType = edge.type
            self.relationStrength = edge.thickness * 2
            self.isDirected = true // 默认有方向
            self.relationDescription = edge.description
            
            self.sourceNodeId = edge.sourceId
            self.targetNodeId = edge.targetId
        }
    }
    
    // 保存关系
    func save() {
        // 保存逻辑将在ViewModel中实现
    }
}
```

### 2. 可视化编辑功能实现

#### 2.1 ViewModel增强

```swift
enum EditMode {
    case select
    case node
    case relation
}

class CognitiveModelVisualizationViewModel: ObservableObject {
    // 编辑状态
    @Published var isEditing: Bool = false
    @Published var editMode: EditMode = .select
    @Published var showNodeEditForm: Bool = false
    @Published var showRelationEditForm: Bool = false
    @Published var selectedSourceNodeId: String? = nil
    @Published var selectedTargetNodeId: String? = nil
    
    // 编辑用ViewModel
    @Published var nodeEditViewModel: NodeEditViewModel? = nil
    @Published var relationEditViewModel: RelationEditViewModel? = nil
    
    // 本地修改记录
    @Published var localChanges: [ModelChange] = []
    
    // 添加新节点
    func addNode() {
        nodeEditViewModel = NodeEditViewModel(isNew: true)
        showNodeEditForm = true
    }
    
    // 编辑节点
    func editNode(_ nodeId: String) {
        if let node = nodes.first(where: { $0.id == nodeId }) {
            nodeEditViewModel = NodeEditViewModel(isNew: false, node: node)
            showNodeEditForm = true
        }
    }
    
    // 保存节点
    func saveNode() {
        guard let viewModel = nodeEditViewModel else { return }
        
        if viewModel.isNew {
            // 创建新节点
            let newNode = VisualizationNode(
                id: UUID().uuidString,
                label: viewModel.nodeLabel,
                type: viewModel.nodeType,
                position: CGPoint(x: 0, y: 0), // 默认位置
                size: viewModel.nodeSize,
                conceptId: UUID().uuidString,
                level: viewModel.nodeLevel,
                description: viewModel.nodeDescription
            )
            
            nodes.append(newNode)
            localChanges.append(.addNode(newNode))
        } else {
            // 更新现有节点
            if let nodeId = viewModel.nodeId, let index = nodes.firstIndex(where: { $0.id == nodeId }) {
                var updatedNode = nodes[index]
                updatedNode.label = viewModel.nodeLabel
                updatedNode.type = viewModel.nodeType
                updatedNode.size = viewModel.nodeSize
                updatedNode.level = viewModel.nodeLevel
                updatedNode.description = viewModel.nodeDescription
                
                nodes[index] = updatedNode
                localChanges.append(.updateNode(updatedNode))
            }
        }
        
        showNodeEditForm = false
        nodeEditViewModel = nil
    }
    
    // 添加新关系
    func addRelation() {
        // 如果已经选择了源节点，直接创建关系编辑ViewModel
        if let sourceNodeId = selectedSourceNodeId {
            relationEditViewModel = RelationEditViewModel(isNew: true)
            relationEditViewModel?.sourceNodeId = sourceNodeId
            relationEditViewModel?.sourceNodeLabel = nodes.first(where: { $0.id == sourceNodeId })?.label ?? ""
            showRelationEditForm = true
        } else {
            // 否则进入选择源节点模式
            editMode = .relation
        }
    }
    
    // 选择关系源节点
    func selectRelationSource(_ nodeId: String) {
        if editMode == .relation {
            selectedSourceNodeId = nodeId
        }
    }
    
    // 选择关系目标节点
    func selectRelationTarget(_ nodeId: String) {
        if editMode == .relation, let sourceNodeId = selectedSourceNodeId, sourceNodeId != nodeId {
            selectedTargetNodeId = nodeId
            
            // 创建关系编辑ViewModel
            relationEditViewModel = RelationEditViewModel(isNew: true)
            relationEditViewModel?.sourceNodeId = sourceNodeId
            relationEditViewModel?.targetNodeId = nodeId
            relationEditViewModel?.sourceNodeLabel = nodes.first(where: { $0.id == sourceNodeId })?.label ?? ""
            relationEditViewModel?.targetNodeLabel = nodes.first(where: { $0.id == nodeId })?.label ?? ""
            
            showRelationEditForm = true
            editMode = .select
            selectedSourceNodeId = nil
            selectedTargetNodeId = nil
        }
    }
    
    // 保存关系
    func saveRelation() {
        guard let viewModel = relationEditViewModel, let sourceId = viewModel.sourceNodeId, let targetId = viewModel.targetNodeId else { return }
        
        if viewModel.isNew {
            // 创建新关系
            let newEdge = VisualizationEdge(
                id: UUID().uuidString,
                sourceId: sourceId,
                targetId: targetId,
                type: viewModel.relationType,
                thickness: viewModel.relationStrength / 2,
                relationId: UUID().uuidString,
                description: viewModel.relationDescription
            )
            
            edges.append(newEdge)
            localChanges.append(.addEdge(newEdge))
        } else {
            // 更新现有关系
            if let relationId = viewModel.relationId, let index = edges.firstIndex(where: { $0.id == relationId }) {
                var updatedEdge = edges[index]
                updatedEdge.type = viewModel.relationType
                updatedEdge.thickness = viewModel.relationStrength / 2
                updatedEdge.description = viewModel.relationDescription
                
                edges[index] = updatedEdge
                localChanges.append(.updateEdge(updatedEdge))
            }
        }
        
        showRelationEditForm = false
        relationEditViewModel = nil
    }
    
    // 取消编辑
    func cancelEdit() {
        showNodeEditForm = false
        showRelationEditForm = false
        nodeEditViewModel = nil
        relationEditViewModel = nil
        selectedSourceNodeId = nil
        selectedTargetNodeId = nil
        editMode = .select
    }
    
    // 保存所有修改
    func saveAllChanges() {
        // 提交本地修改到服务器
        apiService.updateCognitiveModel(
            modelId: modelId,
            changes: localChanges
        ) {
            [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    // 清空本地修改记录
                    self?.localChanges.removeAll()
                    // 关闭编辑模式
                    self?.isEditing = false
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 取消所有修改
    func cancelAllChanges() {
        // 重新加载模型数据
        loadModelData()
        // 清空本地修改记录
        localChanges.removeAll()
        // 关闭编辑模式
        isEditing = false
    }
}

// 模型修改记录
enum ModelChange {
    case addNode(VisualizationNode)
    case updateNode(VisualizationNode)
    case deleteNode(String)
    case addEdge(VisualizationEdge)
    case updateEdge(VisualizationEdge)
    case deleteEdge(String)
}
```

#### 2.2 画布交互增强

```swift
struct VisualizationCanvasView: View {
    @Binding var nodes: [VisualizationNode]
    @Binding var edges: [VisualizationEdge]
    @Binding var selectedNodeId: String?
    @Binding var editMode: EditMode
    @Binding var selectedSourceNodeId: String?
    var onSelectNode: (String) -> Void
    var onDoubleTapNode: (String) -> Void
    
    var body: some View {
        GeometryReader {
            let geometry = $0
            
            ZStack {
                // 绘制边
                ForEach(edges) { edge in
                    VisualizationEdgeView(
                        edge: edge,
                        sourceNode: nodes.first(where: { $0.id == edge.sourceId }),
                        targetNode: nodes.first(where: { $0.id == edge.targetId }),
                        isSelected: false
                    )
                }
                
                // 绘制节点
                ForEach(nodes) { node in
                    VisualizationNodeView(
                        node: node,
                        isSelected: selectedNodeId == node.id,
                        isSourceSelected: selectedSourceNodeId == node.id,
                        onSelect: { onSelectNode(node.id) },
                        onDrag: { newPosition in
                            if let index = nodes.firstIndex(where: { $0.id == node.id }) {
                                nodes[index].position = newPosition
                            }
                        },
                        onDoubleTap: { onDoubleTapNode(node.id) }
                    )
                }
                
                // 添加节点提示（编辑模式下）
                if editMode == .node {
                    VStack {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.appPrimary)
                        Text("点击添加节点")
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                    .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
                    .opacity(0.7)
                }
                
                // 关系绘制辅助线
                if let sourceNodeId = selectedSourceNodeId, let sourceNode = nodes.first(where: { $0.id == sourceNodeId }) {
                    GeometryReader {
                        let proxy = $0
                        
                        Path {
                            $0.move(to: sourceNode.position)
                            $0.addLine(to: CGPoint(x: proxy.frame(in: .global).midX, y: proxy.frame(in: .global).midY))
                        }
                        .stroke(Color.appPrimary.opacity(0.5), style: StrokeStyle(
                            lineWidth: 2,
                            dash: [5, 5]
                        ))
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .onTapGesture {
                // 点击空白处取消选择
                selectedNodeId = nil
            }
        }
    }
}
```

### 3. API服务实现

#### 3.1 模型更新API服务

```swift
class CognitiveModelService {
    // 更新认知模型
    func updateCognitiveModel(
        modelId: String,
        changes: [ModelChange],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        // 转换本地修改为API请求格式
        let updateRequest = CognitiveModelUpdateRequest(
            modelId: modelId,
            changes: changes.map { $0.toApiFormat() }
        )
        
        // 发送API请求
        apiClient.post(
            endpoint: "/api/v1/models/\(modelId)",
            body: updateRequest
        ) { result in
            switch result {
            case .success(_):
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    // 批量更新概念
    func updateConcepts(
        modelId: String,
        concepts: [ConceptUpdate],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        let request = ConceptBatchUpdateRequest(concepts: concepts)
        
        apiClient.post(
            endpoint: "/api/v1/models/\(modelId)/concepts/batch",
            body: request
        ) { result in
            switch result {
            case .success(_):
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    // 批量更新关系
    func updateRelations(
        modelId: String,
        relations: [RelationUpdate],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        let request = RelationBatchUpdateRequest(relations: relations)
        
        apiClient.post(
            endpoint: "/api/v1/models/\(modelId)/relations/batch",
            body: request
        ) { result in
            switch result {
            case .success(_):
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
}

// API请求模型
extension ModelChange {
    func toApiFormat() -> ModelChangeApi {
        switch self {
        case .addNode(let node):
            return ModelChangeApi(
                type: "add",
                entity: "node",
                data: node.toApiFormat()
            )
        case .updateNode(let node):
            return ModelChangeApi(
                type: "update",
                entity: "node",
                id: node.id,
                data: node.toApiFormat()
            )
        case .deleteNode(let nodeId):
            return ModelChangeApi(
                type: "delete",
                entity: "node",
                id: nodeId
            )
        case .addEdge(let edge):
            return ModelChangeApi(
                type: "add",
                entity: "edge",
                data: edge.toApiFormat()
            )
        case .updateEdge(let edge):
            return ModelChangeApi(
                type: "update",
                entity: "edge",
                id: edge.id,
                data: edge.toApiFormat()
            )
        case .deleteEdge(let edgeId):
            return ModelChangeApi(
                type: "delete",
                entity: "edge",
                id: edgeId
            )
        }
    }
}
```

### 4. 实时同步实现

#### 4.1 WebSocket集成

```swift
class WebSocketService {
    // 单例
    static let shared = WebSocketService()
    
    // WebSocket连接
    private var webSocket: URLSessionWebSocketTask?
    private let url = URL(string: "wss://api.example.com/ws")!
    
    // 事件处理器
    var onModelUpdated: ((String, [ModelChange]) -> Void)?
    
    // 连接WebSocket
    func connect(token: String) {
        let request = URLRequest(url: url)
        var requestWithHeaders = request
        requestWithHeaders.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        webSocket = URLSession.shared.webSocketTask(with: requestWithHeaders)
        
        // 开始接收消息
        receiveMessage()
        
        // 恢复连接
        webSocket?.resume()
    }
    
    // 接收消息
    private func receiveMessage() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                self?.handleMessage(message)
                self?.receiveMessage() // 继续接收下一条消息
            case .failure(let error):
                print("WebSocket接收失败: \(error)")
                // 尝试重连
                DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                    self?.connect(token: AuthService.shared.accessToken ?? "")
                }
            }
        }
    }
    
    // 处理消息
    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let string):
            handleStringMessage(string)
        case .data(let data):
            handleDataMessage(data)
        @unknown default:
            print("未知WebSocket消息类型")
        }
    }
    
    // 处理字符串消息
    private func handleStringMessage(_ string: String) {
        do {
            let jsonData = string.data(using: .utf8)!
            let message = try JSONDecoder().decode(WebSocketMessage.self, from: jsonData)
            
            switch message.type {
            case "model_updated":
                if let modelId = message.modelId, let changes = message.changes {
                    onModelUpdated?(modelId, changes)
                }
            default:
                print("未知消息类型: \(message.type)")
            }
        } catch {
            print("WebSocket消息解析失败: \(error)")
        }
    }
    
    // 发送消息
    func sendMessage(_ message: WebSocketMessage) {
        do {
            let jsonData = try JSONEncoder().encode(message)
            let jsonString = String(data: jsonData, encoding: .utf8)!
            webSocket?.send(.string(jsonString)) { error in
                if let error = error {
                    print("WebSocket发送失败: \(error)")
                }
            }
        } catch {
            print("WebSocket消息编码失败: \(error)")
        }
    }
    
    // 断开连接
    func disconnect() {
        webSocket?.cancel(with: .normalClosure, reason: nil)
        webSocket = nil
    }
}

// WebSocket消息模型
struct WebSocketMessage: Codable {
    let type: String
    let modelId: String?
    let changes: [ModelChange]?
    let timestamp: Date
}
```

#### 4.2 实时同步集成

```swift
class CognitiveModelVisualizationViewModel: ObservableObject {
    // 初始化WebSocket监听
    func setupWebSocketListener() {
        WebSocketService.shared.onModelUpdated = { [weak self] modelId, changes in
            // 只处理当前模型的更新
            if modelId == self?.modelId {
                DispatchQueue.main.async {
                    self?.applyRemoteChanges(changes)
                }
            }
        }
    }
    
    // 应用远程变更
    private func applyRemoteChanges(_ changes: [ModelChange]) {
        for change in changes {
            switch change {
            case .addNode(let node):
                if !nodes.contains(where: { $0.id == node.id }) {
                    nodes.append(node)
                }
            case .updateNode(let node):
                if let index = nodes.firstIndex(where: { $0.id == node.id }) {
                    nodes[index] = node
                }
            case .deleteNode(let nodeId):
                nodes.removeAll { $0.id == nodeId }
                edges.removeAll { $0.sourceId == nodeId || $0.targetId == nodeId }
            case .addEdge(let edge):
                if !edges.contains(where: { $0.id == edge.id }) {
                    edges.append(edge)
                }
            case .updateEdge(let edge):
                if let index = edges.firstIndex(where: { $0.id == edge.id }) {
                    edges[index] = edge
                }
            case .deleteEdge(let edgeId):
                edges.removeAll { $0.id == edgeId }
            }
        }
        
        // 重新应用布局
        applyLayout()
    }
}
```

## 测试与验证

1. **单元测试**：
   - 测试编辑功能的正确性
   - 测试本地修改记录的管理
   - 测试WebSocket消息处理

2. **UI测试**：
   - 测试添加节点功能
   - 测试添加关系功能
   - 测试编辑节点和关系属性
   - 测试删除节点和关系
   - 测试保存和取消编辑

3. **集成测试**：
   - 测试从编辑到保存的完整流程
   - 测试实时同步功能
   - 测试多用户协作场景

## 性能优化

1. **本地缓存优化**：
   - 实现本地修改的增量更新
   - 优化WebSocket消息的处理效率

2. **网络优化**：
   - 实现批量更新，减少API调用次数
   - 实现更新冲突检测和解决机制

3. **渲染优化**：
   - 优化编辑模式下的UI渲染
   - 减少编辑操作对可视化性能的影响

## 总结

第21天的开发实现了认知模型的可视化编辑和更新功能，包括：

1. 创建了完整的编辑界面，包括编辑控制面板、节点编辑表单和关系编辑表单
2. 实现了可视化编辑功能，包括添加、编辑、删除节点和关系
3. 实现了模型更新的API服务，支持批量更新
4. 集成了WebSocket实现实时同步功能

这些实现使用户能够直接在可视化界面上编辑认知模型，并实时同步到服务器和其他客户端，提高了认知模型管理的效率和协作性。

通过这三天的开发，我们完成了认知模型可视化模块的全部功能，包括基础实现、优化和编辑功能，为用户提供了一个强大、直观的认知模型可视化工具。