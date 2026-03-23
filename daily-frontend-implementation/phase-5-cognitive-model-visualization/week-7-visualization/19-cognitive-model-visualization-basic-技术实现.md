# Day 19: 认知模型可视化基础实现 - 技术实现文档

## 核心任务概述

实现认知模型可视化的基础功能，包括可视化画布、控制按钮、图例说明，以及力导向图和层次图算法的基础实现，同时支持缩放、拖拽和节点选择等基本交互。

## 技术实现细节

### 1. 认知模型可视化页面UI设计与实现

#### 1.1 可视化主页面布局

```swift
struct CognitiveModelVisualizationView: View {
    @EnvironmentObject var appRouter: AppRouter
    @StateObject private var viewModel = CognitiveModelVisualizationViewModel()
    
    var body: some View {
        NavigationStack(path: $appRouter.path) {
            VStack(spacing: 0) {
                // 顶部导航栏
                VisualizationTopBarView()
                    .background(.appBackground)
                
                // 主要内容区域
                ZStack {
                    // 可视化画布
                    VisualizationCanvasView(
                        nodes: $viewModel.nodes,
                        edges: $viewModel.edges,
                        selectedNodeId: $viewModel.selectedNodeId
                    )
                    
                    // 底部控制栏
                    VisualizationControlBarView(
                        zoomLevel: $viewModel.zoomLevel,
                        viewType: $viewModel.viewType,
                        onZoomIn: { viewModel.zoomIn() },
                        onZoomOut: { viewModel.zoomOut() },
                        onReset: { viewModel.resetView() }
                    )
                    
                    // 图例
                    VisualizationLegendView()
                        .padding()
                        .background(.appBackground.opacity(0.9))
                        .cornerRadius(8)
                        .padding()
                        .position(x: 100, y: 100)
                }
                .background(.appBackgroundSecondary)
            }
            .navigationBarHidden(true)
        }
    }
}
```

#### 1.2 顶部导航栏组件

```swift
struct VisualizationTopBarView: View {
    var body: some View {
        HStack {
            Button(action: {
                // 返回上一页
            }) {
                Image(systemName: "chevron.left")
                    .foregroundColor(.appPrimary)
            }
            
            Spacer()
            
            Text("认知模型可视化")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
            
            Spacer()
            
            Button(action: {
                // 打开设置
            }) {
                Image(systemName: "gearshape")
                    .foregroundColor(.appPrimary)
            }
        }
        .padding()
        .frame(height: 56)
    }
}
```

#### 1.3 底部控制栏组件

```swift
struct VisualizationControlBarView: View {
    @Binding var zoomLevel: CGFloat
    @Binding var viewType: VisualizationViewType
    var onZoomIn: () -> Void
    var onZoomOut: () -> Void
    var onReset: () -> Void
    
    var body: some View {
        VStack {
            // 视图类型切换
            HStack(spacing: 16) {
                Button(action: { viewType = .forceDirected }) {
                    VStack {
                        Image(systemName: "circle.grid.cross")
                        Text("力导向")
                            .font(.caption)
                    }
                    .foregroundColor(viewType == .forceDirected ? .appPrimary : .appTextSecondary)
                }
                
                Button(action: { viewType = .hierarchical }) {
                    VStack {
                        Image(systemName: "square.stack.3d.up")
                        Text("层次图")
                            .font(.caption)
                    }
                    .foregroundColor(viewType == .hierarchical ? .appPrimary : .appTextSecondary)
                }
                
                Button(action: { viewType = .network }) {
                    VStack {
                        Image(systemName: "network")
                        Text("网络拓扑")
                            .font(.caption)
                    }
                    .foregroundColor(viewType == .network ? .appPrimary : .appTextSecondary)
                }
            }
            .padding()
            
            Divider()
            
            // 缩放控制
            HStack(spacing: 16) {
                Button(action: onZoomOut) {
                    Image(systemName: "minus.magnifyingglass")
                        .foregroundColor(.appPrimary)
                }
                
                Text(String(format: "%.1fx", zoomLevel))
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
                    .frame(minWidth: 40)
                
                Button(action: onZoomIn) {
                    Image(systemName: "plus.magnifyingglass")
                        .foregroundColor(.appPrimary)
                }
                
                Spacer()
                
                Button(action: onReset) {
                    Text("重置视图")
                        .font(.caption)
                        .foregroundColor(.appPrimary)
                }
            }
            .padding()
        }
        .background(.appBackground)
        .frame(height: 120)
        .edgesIgnoringSafeArea(.bottom)
    }
}
```

### 2. 认知模型可视化算法实现

#### 2.1 力导向图算法实现

```swift
class ForceDirectedLayout {
    // 节点集合
    var nodes: [VisualizationNode]
    // 边集合
    var edges: [VisualizationEdge]
    
    // 算法参数
    private let repulsionForce: CGFloat = 1000
    private let attractionForce: CGFloat = 0.1
    private let damping: CGFloat = 0.9
    private let minDistance: CGFloat = 50
    
    init(nodes: [VisualizationNode], edges: [VisualizationEdge]) {
        self.nodes = nodes
        self.edges = edges
    }
    
    // 执行一次迭代
    func iterate() {
        // 计算排斥力
        calculateRepulsion()
        
        // 计算吸引力
        calculateAttraction()
        
        // 更新位置
        updatePositions()
    }
    
    // 计算节点间的排斥力
    private func calculateRepulsion() {
        for i in 0..<nodes.count {
            for j in i+1..<nodes.count {
                let node1 = nodes[i]
                let node2 = nodes[j]
                
                let deltaX = node2.position.x - node1.position.x
                let deltaY = node2.position.y - node1.position.y
                let distance = sqrt(deltaX * deltaX + deltaY * deltaY)
                
                if distance > 0 {
                    let force = repulsionForce / (distance * distance)
                    let normalizedX = deltaX / distance
                    let normalizedY = deltaY / distance
                    
                    // 应用排斥力
                    nodes[i].velocity.x -= force * normalizedX
                    nodes[i].velocity.y -= force * normalizedY
                    nodes[j].velocity.x += force * normalizedX
                    nodes[j].velocity.y += force * normalizedY
                }
            }
        }
    }
    
    // 计算边上的吸引力
    private func calculateAttraction() {
        for edge in edges {
            guard let node1Index = nodes.firstIndex(where: { $0.id == edge.sourceId }),
                  let node2Index = nodes.firstIndex(where: { $0.id == edge.targetId }) else {
                continue
            }
            
            let node1 = nodes[node1Index]
            let node2 = nodes[node2Index]
            
            let deltaX = node2.position.x - node1.position.x
            let deltaY = node2.position.y - node1.position.y
            let distance = sqrt(deltaX * deltaX + deltaY * deltaY)
            
            if distance > 0 {
                let force = attractionForce * (distance - minDistance)
                let normalizedX = deltaX / distance
                let normalizedY = deltaY / distance
                
                // 应用吸引力
                nodes[node1Index].velocity.x += force * normalizedX
                nodes[node1Index].velocity.y += force * normalizedY
                nodes[node2Index].velocity.x -= force * normalizedX
                nodes[node2Index].velocity.y -= force * normalizedY
            }
        }
    }
    
    // 更新节点位置
    private func updatePositions() {
        for i in 0..<nodes.count {
            // 应用阻尼
            nodes[i].velocity.x *= damping
            nodes[i].velocity.y *= damping
            
            // 更新位置
            nodes[i].position.x += nodes[i].velocity.x
            nodes[i].position.y += nodes[i].velocity.y
        }
    }
}
```

#### 2.2 层次图算法实现

```swift
class HierarchicalLayout {
    // 节点集合
    var nodes: [VisualizationNode]
    // 边集合
    var edges: [VisualizationEdge]
    
    // 算法参数
    private let levelSpacing: CGFloat = 150
    private let nodeSpacing: CGFloat = 80
    
    init(nodes: [VisualizationNode], edges: [VisualizationEdge]) {
        self.nodes = nodes
        self.edges = edges
    }
    
    // 执行层次布局
    func layout() {
        // 构建图结构
        let graph = buildGraph()
        
        // 计算节点层次
        let levels = calculateLevels(graph)
        
        // 计算每个层次的节点位置
        assignPositions(levels)
    }
    
    // 构建图结构
    private func buildGraph() -> [String: [String]] {
        var graph: [String: [String]] = [:]
        
        // 初始化节点
        for node in nodes {
            graph[node.id] = []
        }
        
        // 添加边
        for edge in edges {
            graph[edge.sourceId]?.append(edge.targetId)
        }
        
        return graph
    }
    
    // 计算节点层次
    private func calculateLevels(_ graph: [String: [String]]) -> [[String]] {
        var levels: [[String]] = []
        var visited: Set<String> = []
        var queue: [(String, Int)] = []
        
        // 找到根节点（入度为0的节点）
        let rootNodes = findRootNodes(graph)
        for root in rootNodes {
            queue.append((root, 0))
            visited.insert(root)
        }
        
        // BFS遍历计算层次
        while !queue.isEmpty {
            let (nodeId, level) = queue.removeFirst()
            
            // 确保level存在
            while levels.count <= level {
                levels.append([])
            }
            levels[level].append(nodeId)
            
            // 遍历子节点
            if let children = graph[nodeId] {
                for child in children {
                    if !visited.contains(child) {
                        queue.append((child, level + 1))
                        visited.insert(child)
                    }
                }
            }
        }
        
        return levels
    }
    
    // 找到根节点
    private func findRootNodes(_ graph: [String: [String]]) -> [String] {
        var inDegree: [String: Int] = [:]
        
        // 初始化入度
        for nodeId in graph.keys {
            inDegree[nodeId] = 0
        }
        
        // 计算入度
        for children in graph.values {
            for child in children {
                inDegree[child, default: 0] += 1
            }
        }
        
        // 返回入度为0的节点
        return inDegree.filter { $0.value == 0 }.map { $0.key }
    }
    
    // 分配节点位置
    private func assignPositions(_ levels: [[String]]) {
        for (levelIndex, levelNodes) in levels.enumerated() {
            let y = CGFloat(levelIndex) * levelSpacing
            let levelCenter = CGFloat(levelNodes.count - 1) * nodeSpacing / 2
            
            for (nodeIndex, nodeId) in levelNodes.enumerated() {
                if let node = nodes.first(where: { $0.id == nodeId }) {
                    let x = CGFloat(nodeIndex) * nodeSpacing - levelCenter
                    node.position = CGPoint(x: x, y: y)
                }
            }
        }
    }
}
```

### 3. 可视化画布与交互实现

#### 3.1 可视化画布组件

```swift
struct VisualizationCanvasView: View {
    @Binding var nodes: [VisualizationNode]
    @Binding var edges: [VisualizationEdge]
    @Binding var selectedNodeId: String?
    
    // 缩放和平移状态
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGPoint = .zero
    @State private var dragOffset: CGPoint = .zero
    @State private var isDragging: Bool = false
    
    var body: some View {
        GeometryReader {
            let geometry = $0
            
            ZStack {
                // 绘制边
                ForEach(edges) { edge in
                    VisualizationEdgeView(
                        edge: edge,
                        sourceNode: nodes.first(where: { $0.id == edge.sourceId }),
                        targetNode: nodes.first(where: { $0.id == edge.targetId })
                    )
                }
                
                // 绘制节点
                ForEach(nodes) { node in
                    VisualizationNodeView(
                        node: node,
                        isSelected: selectedNodeId == node.id,
                        onSelect: { selectedNodeId = node.id },
                        onDrag: { newPosition in
                            if let index = nodes.firstIndex(where: { $0.id == node.id }) {
                                nodes[index].position = newPosition
                            }
                        }
                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .scaleEffect(scale)
            .offset(offset)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        if isDragging {
                            offset = CGPoint(
                                x: dragOffset.x + gesture.translation.width,
                                y: dragOffset.y + gesture.translation.height
                            )
                        }
                    }
                    .onEnded { _ in
                        dragOffset = offset
                        isDragging = false
                    }
            )
            .simultaneousGesture(
                MagnificationGesture()
                    .onChanged { value in
                        scale = max(0.1, min(3.0, value))
                    }
            )
            .onTapGesture {
                isDragging = true
                selectedNodeId = nil
            }
        }
    }
}
```

#### 3.2 节点视图组件

```swift
struct VisualizationNodeView: View {
    let node: VisualizationNode
    let isSelected: Bool
    let onSelect: () -> Void
    let onDrag: (CGPoint) -> Void
    
    // 拖拽状态
    @State private var isDraggingNode: Bool = false
    @State private var initialPosition: CGPoint = .zero
    @State private var dragOffset: CGPoint = .zero
    
    var body: some View {
        Circle()
            .fill(getNodeColor())
            .stroke(isSelected ? Color.appPrimary : Color.appBorder, lineWidth: isSelected ? 3 : 1)
            .frame(width: node.size, height: node.size)
            .overlay(
                Text(node.label)
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(4)
                    .multilineTextAlignment(.center)
            )
            .position(node.position + dragOffset)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        if !isDraggingNode {
                            isDraggingNode = true
                            initialPosition = node.position
                        }
                        dragOffset = gesture.translation
                        onDrag(initialPosition + gesture.translation)
                    }
                    .onEnded { _ in
                        isDraggingNode = false
                        dragOffset = .zero
                    }
            )
            .simultaneousGesture(
                TapGesture()
                    .onEnded { onSelect() }
            )
            .animation(.spring(), value: isSelected)
    }
    
    // 根据节点类型获取颜色
    private func getNodeColor() -> Color {
        switch node.type {
        case .core:
            return Color.appPrimary
        case .secondary:
            return Color.appSecondary
        case .related:
            return Color.appAccent
        case .external:
            return Color.appGray
        }
    }
}
```

#### 3.3 边视图组件

```swift
struct VisualizationEdgeView: View {
    let edge: VisualizationEdge
    let sourceNode: VisualizationNode?
    let targetNode: VisualizationNode?
    
    var body: some View {
        if let source = sourceNode, let target = targetNode {
            Path {
                let start = source.position
                let end = target.position
                
                // 计算贝塞尔曲线控制点
                let controlPointOffset = CGPoint(x: 50, y: 0)
                let controlPoint1 = CGPoint(x: start.x + controlPointOffset.x, y: start.y)
                let controlPoint2 = CGPoint(x: end.x - controlPointOffset.x, y: end.y)
                
                $0.move(to: start)
                $0.addCurve(to: end, control1: controlPoint1, control2: controlPoint2)
            }
            .stroke(getEdgeColor(), lineWidth: edge.thickness)
            .opacity(0.7)
            .overlay(
                // 箭头
                ArrowHeadView(
                    startPoint: source.position,
                    endPoint: target.position,
                    color: getEdgeColor(),
                    thickness: edge.thickness
                )
            )
        }
    }
    
    // 根据边类型获取颜色
    private func getEdgeColor() -> Color {
        switch edge.type {
        case .hierarchical:
            return Color.appPrimary
        case .associative:
            return Color.appSecondary
        case .causal:
            return Color.appAccent
        case .similarity:
            return Color.appSuccess
        }
    }
}
```

#### 3.4 箭头组件

```swift
struct ArrowHeadView: View {
    let startPoint: CGPoint
    let endPoint: CGPoint
    let color: Color
    let thickness: CGFloat
    
    var body: some View {
        let angle = atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)
        let arrowSize = thickness * 5
        
        Path {
            $0.move(to: endPoint)
            $0.addLine(to: CGPoint(
                x: endPoint.x - arrowSize * cos(angle - .pi / 6),
                y: endPoint.y - arrowSize * sin(angle - .pi / 6)
            ))
            $0.move(to: endPoint)
            $0.addLine(to: CGPoint(
                x: endPoint.x - arrowSize * cos(angle + .pi / 6),
                y: endPoint.y - arrowSize * sin(angle + .pi / 6)
            ))
        }
        .stroke(color, lineWidth: thickness)
    }
}
```

### 4. 数据模型定义

```swift
// 可视化节点模型
enum VisualizationNodeType {
    case core
    case secondary
    case related
    case external
}

struct VisualizationNode: Identifiable, Equatable {
    let id: String
    let label: String
    let type: VisualizationNodeType
    var position: CGPoint
    let size: CGFloat
    var velocity: CGPoint = .zero
    var conceptId: String
    
    static func == (lhs: VisualizationNode, rhs: VisualizationNode) -> Bool {
        lhs.id == rhs.id
    }
}

// 可视化边模型
enum VisualizationEdgeType {
    case hierarchical
    case associative
    case causal
    case similarity
}

struct VisualizationEdge: Identifiable, Equatable {
    let id: String
    let sourceId: String
    let targetId: String
    let type: VisualizationEdgeType
    let thickness: CGFloat
    let relationId: String
    
    static func == (lhs: VisualizationEdge, rhs: VisualizationEdge) -> Bool {
        lhs.id == rhs.id
    }
}

// 可视化视图类型
enum VisualizationViewType {
    case forceDirected
    case hierarchical
    case network
}
```

### 5. ViewModel实现

```swift
class CognitiveModelVisualizationViewModel: ObservableObject {
    // 模型ID
    let modelId: String
    
    // 可视化数据
    @Published var nodes: [VisualizationNode] = []
    @Published var edges: [VisualizationEdge] = []
    @Published var selectedNodeId: String? = nil
    
    // 视图状态
    @Published var zoomLevel: CGFloat = 1.0
    @Published var viewType: VisualizationViewType = .forceDirected
    @Published var isLoading: Bool = true
    @Published var error: Error? = nil
    
    // 服务
    private let apiService: CognitiveModelService
    private let layoutEngine: LayoutEngine
    
    // 定时器用于力导向图动画
    private var animationTimer: Timer?
    
    init(modelId: String = "default", apiService: CognitiveModelService = AppContainer.shared.resolve(CognitiveModelService.self)!) {
        self.modelId = modelId
        self.apiService = apiService
        self.layoutEngine = LayoutEngine()
        
        // 加载数据
        loadModelData()
    }
    
    // 加载模型数据
    func loadModelData() {
        isLoading = true
        error = nil
        
        apiService.getCognitiveModelDetail(modelId: modelId) {
            [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                switch result {
                case .success(let model):
                    self?.processModelData(model)
                case .failure(let error):
                    self?.error = error
                }
            }
        }
    }
    
    // 处理模型数据为可视化数据
    private func processModelData(_ model: CognitiveModel) {
        // 转换节点
        let visualizationNodes = model.concepts.map { concept in
            VisualizationNode(
                id: "node_\(concept.id)",
                label: concept.name,
                type: getNodeType(from: concept.type),
                position: CGPoint(x: .random(in: -200...200), y: .random(in: -200...200)),
                size: getNodeSize(from: concept.level),
                conceptId: concept.id
            )
        }
        
        // 转换边
        let visualizationEdges = model.relations.map { relation in
            VisualizationEdge(
                id: "edge_\(relation.id)",
                sourceId: "node_\(relation.sourceId)",
                targetId: "node_\(relation.targetId)",
                type: getEdgeType(from: relation.type),
                thickness: getEdgeThickness(from: relation.strength),
                relationId: relation.id
            )
        }
        
        self.nodes = visualizationNodes
        self.edges = visualizationEdges
        
        // 应用布局
        applyLayout()
    }
    
    // 应用布局
    func applyLayout() {
        switch viewType {
        case .forceDirected:
            applyForceDirectedLayout()
        case .hierarchical:
            applyHierarchicalLayout()
        case .network:
            applyNetworkLayout()
        }
    }
    
    // 应用力导向图布局
    private func applyForceDirectedLayout() {
        // 启动动画定时器
        animationTimer?.invalidate()
        animationTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) {
            [weak self] _ in
            guard let self = self else { return }
            
            // 执行力导向图迭代
            layoutEngine.forceDirectedLayout(nodes: &self.nodes, edges: self.edges)
        }
    }
    
    // 应用层次图布局
    private func applyHierarchicalLayout() {
        animationTimer?.invalidate()
        layoutEngine.hierarchicalLayout(nodes: &nodes, edges: edges)
    }
    
    // 应用网络拓扑图布局
    private func applyNetworkLayout() {
        animationTimer?.invalidate()
        // 网络拓扑图布局逻辑
    }
    
    // 缩放功能
    func zoomIn() {
        zoomLevel = min(3.0, zoomLevel + 0.1)
    }
    
    func zoomOut() {
        zoomLevel = max(0.1, zoomLevel - 0.1)
    }
    
    // 重置视图
    func resetView() {
        zoomLevel = 1.0
        selectedNodeId = nil
        
        // 重新应用布局
        applyLayout()
    }
    
    // 辅助方法：获取节点类型
    private func getNodeType(from conceptType: ConceptType) -> VisualizationNodeType {
        switch conceptType {
        case .core:
            return .core
        case .secondary:
            return .secondary
        case .related:
            return .related
        case .external:
            return .external
        }
    }
    
    // 辅助方法：获取节点大小
    private func getNodeSize(from level: Int) -> CGFloat {
        switch level {
        case 1:
            return 60
        case 2:
            return 50
        case 3:
            return 40
        default:
            return 30
        }
    }
    
    // 辅助方法：获取边类型
    private func getEdgeType(from relationType: RelationType) -> VisualizationEdgeType {
        switch relationType {
        case .hierarchical:
            return .hierarchical
        case .associative:
            return .associative
        case .causal:
            return .causal
        case .similarity:
            return .similarity
        }
    }
    
    // 辅助方法：获取边粗细
    private func getEdgeThickness(from strength: Int) -> CGFloat {
        return CGFloat(strength) / 2.0
    }
    
    deinit {
        animationTimer?.invalidate()
    }
}
```

### 6. 布局引擎

```swift
class LayoutEngine {
    // 力导向图布局
    func forceDirectedLayout(nodes: inout [VisualizationNode], edges: [VisualizationEdge]) {
        let layout = ForceDirectedLayout(nodes: nodes, edges: edges)
        layout.iterate()
        
        // 更新节点位置
        for i in 0..<nodes.count {
            nodes[i] = layout.nodes[i]
        }
    }
    
    // 层次图布局
    func hierarchicalLayout(nodes: inout [VisualizationNode], edges: [VisualizationEdge]) {
        let layout = HierarchicalLayout(nodes: nodes, edges: edges)
        layout.layout()
        
        // 更新节点位置
        for i in 0..<nodes.count {
            nodes[i] = layout.nodes[i]
        }
    }
    
    // 网络拓扑图布局
    func networkLayout(nodes: inout [VisualizationNode], edges: [VisualizationEdge]) {
        // 网络拓扑图布局实现
    }
}
```

## 测试与验证

1. **单元测试**：
   - 测试布局算法的正确性
   - 测试ViewModel的状态管理
   - 测试节点和边的转换逻辑

2. **UI测试**：
   - 测试可视化页面的加载
   - 测试缩放和拖拽功能
   - 测试视图类型切换
   - 测试节点选择功能

3. **集成测试**：
   - 测试从API获取数据到可视化展示的完整流程
   - 测试不同类型认知模型的可视化效果

## 性能优化

1. **节点渲染优化**：
   - 使用`DrawingGroup`优化大量节点的渲染
   - 实现节点的可见性裁剪

2. **布局算法优化**：
   - 限制力导向图的迭代次数
   - 实现布局结果的缓存

3. **内存优化**：
   - 及时释放动画定时器
   - 优化数据结构，减少内存占用

## 总结

第19天的开发实现了认知模型可视化的基础功能，包括：

1. 创建了完整的可视化页面UI，包括导航栏、画布、控制栏和图例
2. 实现了力导向图和层次图两种核心布局算法
3. 实现了节点和边的可视化渲染
4. 支持缩放、拖拽和节点选择等基本交互
5. 构建了完整的数据转换和状态管理逻辑

这些实现为后续的可视化优化和编辑功能奠定了基础。明天将继续优化可视化效果和交互体验。