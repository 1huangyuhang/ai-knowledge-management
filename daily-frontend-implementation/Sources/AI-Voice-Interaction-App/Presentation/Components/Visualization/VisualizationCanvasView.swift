import SwiftUI

// 可视化画布组件
struct VisualizationCanvasView: View {
    @Binding var nodes: [VisualizationNode]
    @Binding var edges: [VisualizationEdge]
    @Binding var selectedNodeId: String?
    @Binding var editMode: EditMode
    @Binding var selectedSourceNodeId: String?
    
    var onSelectNode: (String) -> Void
    var onDoubleTapNode: (String) -> Void
    
    // 缩放和平移状态
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGPoint = .zero
    @State private var dragOffset: CGPoint = .zero
    @State private var isDragging: Bool = false
    
    var body: some View {
        GeometryReader {
            let geometry = $0
            
            ZStack {
                // 绘制背景网格（可选）
                GridBackground()
                
                // 绘制边
                ForEach(edges, id: \.id) { edge in
                    VisualizationEdgeView(
                        edge: edge,
                        sourceNode: self.getSourceNode(for: edge),
                        targetNode: self.getTargetNode(for: edge),
                        isSelected: false
                    )
                }
                
                // 绘制节点
                ForEach(nodes, id: \.id) { node in
                    self.getNodeView(for: node)
                }
                
                // 添加节点提示（编辑模式下）
                if editMode == .node {
                    self.getEditModePromptView()
                        .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
                }
                
                // 关系绘制辅助线
                self.getRelationshipHelperLineView()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .scaleEffect(scale)
            .offset(CGSize(width: offset.x, height: offset.y))
            .gesture(self.getDragGesture())
            .simultaneousGesture(self.getMagnificationGesture())
            .onTapGesture {
                isDragging = true
                selectedNodeId = nil
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func getSourceNode(for edge: VisualizationEdge) -> VisualizationNode? {
        return nodes.first(where: { $0.id == edge.sourceId })
    }
    
    private func getTargetNode(for edge: VisualizationEdge) -> VisualizationNode? {
        return nodes.first(where: { $0.id == edge.targetId })
    }
    
    private func getNodeView(for node: VisualizationNode) -> some View {
        return VisualizationNodeView(
            node: node,
            isSelected: selectedNodeId == node.id,
            isSourceSelected: selectedSourceNodeId == node.id,
            onSelect: { onSelectNode(node.id) },
            onDrag: { newPosition in
                self.onNodeDrag(node, newPosition: newPosition)
            },
            onDoubleTap: { onDoubleTapNode(node.id) },
            onHover: { _ in }
        )
    }
    
    private func onNodeDrag(_ node: VisualizationNode, newPosition: CGPoint) {
        if let index = nodes.firstIndex(where: { $0.id == node.id }) {
            nodes[index].position = newPosition
        }
    }
    
    private func getEditModePromptView() -> some View {
        return VStack {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(Color.appPrimary)
            Text("点击添加节点")
                .font(.caption)
                .foregroundColor(Color.appTextSecondary)
        }
        .opacity(0.7)
    }
    
    private func getRelationshipHelperLineView() -> some View {
        Group {
            if let sourceNodeId = selectedSourceNodeId, let sourceNode = nodes.first(where: { $0.id == sourceNodeId }) {
                GeometryReader {
                    let proxy = $0
                    
                    Path {
                        $0.move(to: CGPoint(
                            x: sourceNode.position.x * scale + offset.x,
                            y: sourceNode.position.y * scale + offset.y
                        ))
                        $0.addLine(to: CGPoint(x: proxy.frame(in: .global).midX, y: proxy.frame(in: .global).midY))
                    }
                    .stroke(Color.appPrimary.opacity(0.5), style: StrokeStyle(
                        lineWidth: 2,
                        dash: [5, 5]
                    ))
                }
            } else {
                EmptyView()
            }
        }
    }
    
    private func getDragGesture() -> some Gesture {
        return DragGesture()
            .onChanged { gesture in
                if !isDragging {
                    isDragging = true
                    dragOffset = offset
                }
                offset = CGPoint(
                    x: dragOffset.x + gesture.translation.width,
                    y: dragOffset.y + gesture.translation.height
                )
            }
            .onEnded { _ in
                isDragging = false
            }
    }
    
    private func getMagnificationGesture() -> some Gesture {
        return MagnificationGesture()
            .onChanged { value in
                scale = max(0.1, min(3.0, value))
            }
    }
}

// 网格背景组件（可选）
struct GridBackground: View {
    private let gridSize: CGFloat = 20
    private let gridColor: Color = Color.gray.opacity(0.2)
    
    var body: some View {
        GeometryReader {geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            
            Path {
                // 绘制垂直线
                for x in stride(from: 0, to: width, by: gridSize) {
                    $0.move(to: CGPoint(x: x, y: 0))
                    $0.addLine(to: CGPoint(x: x, y: height))
                }
                
                // 绘制水平线
                for y in stride(from: 0, to: height, by: gridSize) {
                    $0.move(to: CGPoint(x: 0, y: y))
                    $0.addLine(to: CGPoint(x: width, y: y))
                }
            }
            .stroke(gridColor, lineWidth: 0.5)
        }
    }
}
