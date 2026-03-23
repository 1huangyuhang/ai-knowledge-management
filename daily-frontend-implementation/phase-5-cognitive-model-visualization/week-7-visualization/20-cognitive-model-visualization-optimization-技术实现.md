# Day 20: 认知模型可视化优化 - 技术实现文档

## 核心任务概述

优化认知模型可视化的效果和交互体验，包括节点和边的样式优化、丰富的交互功能以及不同视图类型的切换。

## 技术实现细节

### 1. 节点和边的样式优化

#### 1.1 节点样式增强

```swift
struct VisualizationNodeView: View {
    let node: VisualizationNode
    let isSelected: Bool
    let onSelect: () -> Void
    let onDrag: (CGPoint) -> Void
    let onDoubleTap: () -> Void
    let onHover: (Bool) -> Void
    
    // 状态
    @State private var isDraggingNode: Bool = false
    @State private var initialPosition: CGPoint = .zero
    @State private var dragOffset: CGPoint = .zero
    @State private var isHovered: Bool = false
    
    var body: some View {
        ZStack {
            // 节点背景光环（悬停效果）
            if isHovered || isSelected {
                Circle()
                    .fill(getNodeColor().opacity(0.3))
                    .frame(width: node.size * 1.5, height: node.size * 1.5)
                    .transition(.scale)
                    .animation(.spring(), value: isHovered || isSelected)
            }
            
            // 节点主体
            Circle()
                .fill(getNodeColor())
                .stroke(isSelected ? Color.appPrimary : Color.appBorder, lineWidth: isSelected ? 3 : 1)
                .frame(width: node.size, height: node.size)
                .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                .overlay(
                    // 节点图标
                    getNodeIcon()
                        .font(.system(size: node.size * 0.4))
                        .foregroundColor(.white)
                )
                .overlay(
                    // 节点标签（外部）
                    Text(node.label)
                        .font(.caption)
                        .foregroundColor(.appTextPrimary)
                        .padding(4)
                        .background(.appBackground.opacity(0.9))
                        .cornerRadius(4)
                        .offset(y: node.size * 0.6)
                        .opacity(isHovered || isSelected ? 1 : 0)
                        .transition(.opacity)
                )
                .overlay(
                    // 节点连接点指示器
                    VStack(spacing: 0) {
                        Circle()
                            .fill(Color.appPrimary)
                            .frame(width: 8, height: 8)
                            .opacity(isSelected ? 1 : 0)
                        Spacer()
                        HStack(spacing: 0) {
                            Spacer()
                            Circle()
                                .fill(Color.appPrimary)
                                .frame(width: 8, height: 8)
                                .opacity(isSelected ? 1 : 0)
                            Spacer()
                            Circle()
                                .fill(Color.appPrimary)
                                .frame(width: 8, height: 8)
                                .opacity(isSelected ? 1 : 0)
                            Spacer()
                        }
                        Spacer()
                        Circle()
                            .fill(Color.appPrimary)
                            .frame(width: 8, height: 8)
                            .opacity(isSelected ? 1 : 0)
                    }
                    .frame(width: node.size, height: node.size)
                )
        }
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
        .simultaneousGesture(
            TapGesture(count: 2)
                .onEnded { onDoubleTap() }
        )
        .onHover {
            isHovered = $0
            onHover($0)
        }
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
    
    // 根据节点类型获取图标
    private func getNodeIcon() -> Image {
        switch node.type {
        case .core:
            return Image(systemName: "star.fill")
        case .secondary:
            return Image(systemName: "circle.fill")
        case .related:
            return Image(systemName: "link")
        case .external:
            return Image(systemName: "arrow.up.right.square.fill")
        }
    }
}
```

#### 1.2 边样式增强

```swift
struct VisualizationEdgeView: View {
    let edge: VisualizationEdge
    let sourceNode: VisualizationNode?
    let targetNode: VisualizationNode?
    let isSelected: Bool
    
    var body: some View {
        if let source = sourceNode, let target = targetNode {
            ZStack {
                // 边的背景（选中效果）
                if isSelected {
                    Path {
                        let start = source.position
                        let end = target.position
                        let controlPointOffset = CGPoint(x: 50, y: 0)
                        let controlPoint1 = CGPoint(x: start.x + controlPointOffset.x, y: start.y)
                        let controlPoint2 = CGPoint(x: end.x - controlPointOffset.x, y: end.y)
                        
                        $0.move(to: start)
                        $0.addCurve(to: end, control1: controlPoint1, control2: controlPoint2)
                    }
                    .stroke(Color.appPrimary.opacity(0.5), lineWidth: edge.thickness * 2)
                }
                
                // 边的主体
                Path {
                    let start = source.position
                    let end = target.position
                    let controlPointOffset = CGPoint(x: 50, y: 0)
                    let controlPoint1 = CGPoint(x: start.x + controlPointOffset.x, y: start.y)
                    let controlPoint2 = CGPoint(x: end.x - controlPointOffset.x, y: end.y)
                    
                    $0.move(to: start)
                    $0.addCurve(to: end, control1: controlPoint1, control2: controlPoint2)
                }
                .stroke(style: StrokeStyle(
                    lineWidth: edge.thickness,
                    lineCap: .round,
                    lineJoin: .round,
                    dash: edge.type == .associative ? [5, 5] : []
                ))
                .fill(getEdgeColor())
                .opacity(0.8)
                .overlay(
                    // 边的箭头
                    ArrowHeadView(
                        startPoint: source.position,
                        endPoint: target.position,
                        color: getEdgeColor(),
                        thickness: edge.thickness
                    )
                )
                .overlay(
                    // 边的标签
                    getEdgeLabel()
                        .position(getEdgeMidPoint(source.position, target.position))
                )
            }
        }
    }
    
    // 获取边的中点
    private func getEdgeMidPoint(_ start: CGPoint, _ end: CGPoint) -> CGPoint {
        let controlPointOffset = CGPoint(x: 50, y: 0)
        let controlPoint1 = CGPoint(x: start.x + controlPointOffset.x, y: start.y)
        let controlPoint2 = CGPoint(x: end.x - controlPointOffset.x, y: end.y)
        
        // 贝塞尔曲线中点近似
        return CGPoint(
            x: (start.x + 2 * controlPoint1.x + 2 * controlPoint2.x + end.x) / 6,
            y: (start.y + 2 * controlPoint1.y + 2 * controlPoint2.y + end.y) / 6
        )
    }
    
    // 获取边的标签
    private func getEdgeLabel() -> some View {
        Text(getEdgeTypeName())
            .font(.caption2)
            .foregroundColor(.appTextSecondary)
            .padding(2)
            .background(.appBackground.opacity(0.9))
            .cornerRadius(2)
    }
    
    // 获取边类型名称
    private func getEdgeTypeName() -> String {
        switch edge.type {
        case .hierarchical:
            return "层次"
        case .associative:
            return "关联"
        case .causal:
            return "因果"
        case .similarity:
            return "相似"
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

### 2. 丰富的交互功能

#### 2.1 节点详情查看

```swift
struct NodeDetailView: View {
    let node: VisualizationNode
    let onClose: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题栏
            HStack {
                Text("节点详情")
                    .font(.headline)
                    .foregroundColor(.appTextPrimary)
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .foregroundColor(.appTextSecondary)
                }
            }
            
            // 节点基本信息
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Circle()
                        .fill(getNodeColor())
                        .frame(width: 40, height: 40)
                        .overlay(
                            getNodeIcon()
                                .font(.system(size: 20))
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading) {
                        Text(node.label)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.appTextPrimary)
                        Text(getNodeTypeName())
                            .font(.caption)
                            .foregroundColor(.appTextSecondary)
                    }
                    .padding(.leading, 12)
                }
                
                Divider()
                
                // 属性列表
                VStack(alignment: .leading, spacing: 6) {
                    PropertyRow(label: "ID", value: node.id)
                    PropertyRow(label: "概念ID", value: node.conceptId)
                    PropertyRow(label: "类型", value: getNodeTypeName())
                    PropertyRow(label: "大小", value: String(format: "%.0fpx", node.size))
                }
            }
            .padding()
            .background(.appBackgroundSecondary)
            .cornerRadius(8)
            
            // 操作按钮
            HStack(spacing: 12) {
                Button(action: {
                    // 编辑节点
                }) {
                    Label("编辑", systemImage: "pencil")
                        .font(.caption)
                }
                .buttonStyle(PrimaryButtonStyle())
                
                Button(action: {
                    // 删除节点
                }) {
                    Label("删除", systemImage: "trash")
                        .font(.caption)
                }
                .buttonStyle(DangerButtonStyle())
                
                Spacer()
                
                Button(action: {
                    // 查看相关概念
                }) {
                    Label("查看概念", systemImage: "doc.text")
                        .font(.caption)
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
        .padding()
        .background(.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(maxWidth: 300)
    }
    
    // 属性行组件
    struct PropertyRow: View {
        let label: String
        let value: String
        
        var body: some View {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
                    .frame(width: 60, alignment: .leading)
                Text(value)
                    .font(.caption)
                    .foregroundColor(.appTextPrimary)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
        }
    }
    
    // 获取节点颜色
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
    
    // 获取节点图标
    private func getNodeIcon() -> Image {
        switch node.type {
        case .core:
            return Image(systemName: "star.fill")
        case .secondary:
            return Image(systemName: "circle.fill")
        case .related:
            return Image(systemName: "link")
        case .external:
            return Image(systemName: "arrow.up.right.square.fill")
        }
    }
    
    // 获取节点类型名称
    private func getNodeTypeName() -> String {
        switch node.type {
        case .core:
            return "核心概念"
        case .secondary:
            return "次要概念"
        case .related:
            return "相关概念"
        case .external:
            return "外部概念"
        }
    }
}
```

#### 2.2 多选和批量操作

```swift
class CognitiveModelVisualizationViewModel: ObservableObject {
    // 新增：多选状态
    @Published var selectedNodeIds: Set<String> = []
    @Published var isMultiSelectMode: Bool = false
    
    // 新增：批量操作方法
    func toggleMultiSelectMode() {
        isMultiSelectMode = !isMultiSelectMode
        if !isMultiSelectMode {
            selectedNodeIds.removeAll()
        }
    }
    
    func toggleNodeSelection(_ nodeId: String) {
        if isMultiSelectMode {
            if selectedNodeIds.contains(nodeId) {
                selectedNodeIds.remove(nodeId)
            } else {
                selectedNodeIds.insert(nodeId)
            }
        } else {
            selectedNodeIds = [nodeId]
        }
    }
    
    func clearSelection() {
        selectedNodeIds.removeAll()
    }
    
    func deleteSelectedNodes() {
        // 批量删除节点逻辑
        for nodeId in selectedNodeIds {
            deleteNode(nodeId)
        }
        selectedNodeIds.removeAll()
    }
    
    func deleteNode(_ nodeId: String) {
        // 删除单个节点逻辑
        nodes.removeAll { $0.id == nodeId }
        edges.removeAll { $0.sourceId == nodeId || $0.targetId == nodeId }
    }
}
```

#### 2.3 视图类型切换优化

```swift
struct VisualizationControlBarView: View {
    @Binding var zoomLevel: CGFloat
    @Binding var viewType: VisualizationViewType
    @Binding var isMultiSelectMode: Bool
    var onZoomIn: () -> Void
    var onZoomOut: () -> Void
    var onReset: () -> Void
    var onToggleMultiSelect: () -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部操作栏
            HStack(spacing: 16) {
                // 视图类型切换
                ViewTypeToggleButton(
                    viewType: $viewType,
                    targetType: .forceDirected,
                    icon: "circle.grid.cross",
                    label: "力导向"
                )
                
                ViewTypeToggleButton(
                    viewType: $viewType,
                    targetType: .hierarchical,
                    icon: "square.stack.3d.up",
                    label: "层次图"
                )
                
                ViewTypeToggleButton(
                    viewType: $viewType,
                    targetType: .network,
                    icon: "network",
                    label: "网络拓扑"
                )
                
                Spacer()
                
                // 多选模式切换
                Button(action: onToggleMultiSelect) {
                    VStack {
                        Image(systemName: isMultiSelectMode ? "checkmark.circle.fill" : "circle")
                        Text("多选")
                            .font(.caption)
                    }
                    .foregroundColor(isMultiSelectMode ? .appPrimary : .appTextSecondary)
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
    
    // 视图类型切换按钮组件
    struct ViewTypeToggleButton<Type: RawRepresentable & Hashable>: View {
        @Binding var viewType: Type
        let targetType: Type
        let icon: String
        let label: String
        
        var body: some View {
            Button(action: { viewType = targetType }) {
                VStack {
                    Image(systemName: icon)
                    Text(label)
                        .font(.caption)
                }
                .foregroundColor(viewType == targetType ? .appPrimary : .appTextSecondary)
                .padding(8)
                .background(viewType == targetType ? .appPrimary.opacity(0.1) : .clear)
                .cornerRadius(8)
            }
        }
    }
}
```

### 3. 网络拓扑图实现

```swift
class NetworkLayout {
    // 节点集合
    var nodes: [VisualizationNode]
    // 边集合
    var edges: [VisualizationEdge]
    
    // 算法参数
    private let nodeSpacing: CGFloat = 100
    private let iterations: Int = 50
    
    init(nodes: [VisualizationNode], edges: [VisualizationEdge]) {
        self.nodes = nodes
        self.edges = edges
    }
    
    // 执行网络拓扑布局
    func layout() {
        // 基于圆形布局的网络拓扑图
        let center = CGPoint(x: 0, y: 0)
        let radius = CGFloat(nodes.count) * nodeSpacing / (2 * .pi)
        
        for (index, node) in nodes.enumerated() {
            let angle = 2 * .pi * CGFloat(index) / CGFloat(nodes.count)
            let x = center.x + radius * cos(angle)
            let y = center.y + radius * sin(angle)
            
            nodes[index].position = CGPoint(x: x, y: y)
        }
        
        // 应用力导向图微调
        let forceLayout = ForceDirectedLayout(nodes: nodes, edges: edges)
        for _ in 0..<iterations {
            forceLayout.iterate()
        }
        
        // 更新节点位置
        for i in 0..<nodes.count {
            nodes[i] = forceLayout.nodes[i]
        }
    }
}
```

### 4. 可视化效果增强

#### 4.1 动画效果优化

```swift
class CognitiveModelVisualizationViewModel: ObservableObject {
    // 新增：动画状态
    @Published var isAnimating: Bool = false
    
    // 优化：应用布局时添加过渡动画
    func applyLayout() {
        isAnimating = true
        
        switch viewType {
        case .forceDirected:
            applyForceDirectedLayout()
        case .hierarchical:
            applyHierarchicalLayout()
        case .network:
            applyNetworkLayout()
        }
        
        // 延迟关闭动画状态
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.isAnimating = false
        }
    }
    
    // 优化：力导向图动画
    private func applyForceDirectedLayout() {
        // 启动动画定时器
        animationTimer?.invalidate()
        animationTimer = Timer.scheduledTimer(withTimeInterval: 0.03, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            // 执行力导向图迭代
            layoutEngine.forceDirectedLayout(nodes: &self.nodes, edges: self.edges)
        }
    }
}
```

#### 4.2 图例增强

```swift
struct VisualizationLegendView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("图例")
                .font(.headline)
                .foregroundColor(.appTextPrimary)
            
            // 节点类型图例
            VStack(alignment: .leading, spacing: 8) {
                Text("节点类型")
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
                
                LegendItem(color: .appPrimary, icon: "star.fill", label: "核心概念")
                LegendItem(color: .appSecondary, icon: "circle.fill", label: "次要概念")
                LegendItem(color: .appAccent, icon: "link", label: "相关概念")
                LegendItem(color: .appGray, icon: "arrow.up.right.square.fill", label: "外部概念")
            }
            
            Divider()
            
            // 边类型图例
            VStack(alignment: .leading, spacing: 8) {
                Text("边类型")
                    .font(.caption)
                    .foregroundColor(.appTextSecondary)
                
                LegendItem(color: .appPrimary, icon: "arrow.right", label: "层次关系", isEdge: true)
                LegendItem(color: .appSecondary, icon: "arrow.right", label: "关联关系", isEdge: true, isDashed: true)
                LegendItem(color: .appAccent, icon: "arrow.right", label: "因果关系", isEdge: true)
                LegendItem(color: .appSuccess, icon: "arrow.right", label: "相似关系", isEdge: true)
            }
        }
        .padding()
        .background(.appBackground.opacity(0.9))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.1), radius: 5)
    }
    
    // 图例项组件
    struct LegendItem: View {
        let color: Color
        let icon: String
        let label: String
        let isEdge: Bool = false
        let isDashed: Bool = false
        
        var body: some View {
            HStack(spacing: 8) {
                if isEdge {
                    // 边图例
                    ZStack {
                        if isDashed {
                            Path {
                                $0.move(to: CGPoint(x: 0, y: 5))
                                $0.addLine(to: CGPoint(x: 20, y: 5))
                            }
                            .stroke(color, style: StrokeStyle(lineWidth: 2, dash: [3, 3]))
                        } else {
                            Path {
                                $0.move(to: CGPoint(x: 0, y: 5))
                                $0.addLine(to: CGPoint(x: 20, y: 5))
                            }
                            .stroke(color, lineWidth: 2)
                        }
                        
                        // 箭头
                        Path {
                            $0.move(to: CGPoint(x: 15, y: 2))
                            $0.addLine(to: CGPoint(x: 20, y: 5))
                            $0.addLine(to: CGPoint(x: 15, y: 8))
                        }
                        .fill(color)
                    }
                    .frame(width: 25, height: 10)
                } else {
                    // 节点图例
                    Circle()
                        .fill(color)
                        .frame(width: 16, height: 16)
                        .overlay(
                            Image(systemName: icon)
                                .font(.system(size: 8))
                                .foregroundColor(.white)
                        )
                }
                
                Text(label)
                    .font(.caption)
                    .foregroundColor(.appTextPrimary)
            }
        }
    }
}
```

## 测试与验证

1. **单元测试**：
   - 测试增强后的节点和边样式
   - 测试新增的交互功能
   - 测试网络拓扑图布局算法

2. **UI测试**：
   - 测试节点悬停和选中效果
   - 测试节点详情查看
   - 测试多选和批量操作
   - 测试视图类型切换

3. **集成测试**：
   - 测试不同视图类型下的可视化效果
   - 测试大规模认知模型的可视化性能
   - 测试各种交互场景的流畅性

## 性能优化

1. **渲染优化**：
   - 实现节点和边的可见性裁剪
   - 使用`DrawingGroup`优化复杂图形渲染
   - 延迟加载远离视图中心的节点标签

2. **算法优化**：
   - 减少力导向图的迭代次数
   - 实现布局结果的缓存
   - 优化网络拓扑图的计算效率

3. **内存优化**：
   - 及时释放不再使用的动画资源
   - 优化数据结构，减少内存占用
   - 实现节点和边的复用机制

## 总结

第20天的开发优化了认知模型可视化的效果和交互体验，包括：

1. 增强了节点和边的样式，添加了悬停效果、图标、标签等
2. 实现了丰富的交互功能，包括节点详情查看、多选和批量操作
3. 优化了视图类型切换，添加了网络拓扑图布局
4. 增强了可视化效果，添加了过渡动画和优化的图例
5. 优化了性能，提高了大规模认知模型的渲染效率

这些优化使认知模型可视化更加直观、交互更加流畅，为用户提供了更好的使用体验。明天将继续实现认知模型的可视化编辑和更新功能。