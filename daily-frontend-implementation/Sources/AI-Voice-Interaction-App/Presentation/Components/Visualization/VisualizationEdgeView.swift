import SwiftUI

/// 可视化边视图，用于显示认知模型中的节点关系
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
                .stroke(getEdgeColor(), style: StrokeStyle(
                    lineWidth: edge.thickness,
                    lineCap: .round,
                    lineJoin: .round,
                    dash: edge.type == .associative ? [5, 5] : []
                ))
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
            .foregroundColor(Color.appTextSecondary)
            .padding(2)
            .background(Color.appBackground.opacity(0.9))
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