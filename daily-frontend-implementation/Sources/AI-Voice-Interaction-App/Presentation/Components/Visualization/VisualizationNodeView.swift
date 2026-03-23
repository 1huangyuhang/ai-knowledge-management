import SwiftUI
import CoreGraphics

/// CGPoint扩展，支持相加操作
fileprivate extension CGPoint {
    static func +(lhs: CGPoint, rhs: CGPoint) -> CGPoint {
        return CGPoint(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
    }
}

/// 可视化节点视图
struct VisualizationNodeView: View {
    let node: VisualizationNode
    let isSelected: Bool
    let isSourceSelected: Bool
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
            if isHovered || isSelected || isSourceSelected {
                Circle()
                    .fill(isSourceSelected ? Color.appPrimary.opacity(0.5) : getNodeColor().opacity(0.3))
                    .frame(width: node.size * 1.5, height: node.size * 1.5)
                    .transition(.scale)
                    .animation(.spring(), value: isHovered || isSelected || isSourceSelected)
            }
            
            // 节点主体
            ZStack {
                // 填充圆形
                Circle()
                    .foregroundColor(getNodeColor())
                    .frame(width: node.size, height: node.size)
                
                // 描边圆形
                Circle()
                    .strokeBorder(
                        isSelected ? Color.appPrimary : (isSourceSelected ? Color.appPrimary : Color.appBorder),
                        lineWidth: (isSelected || isSourceSelected) ? 3 : 1
                    )
                    .frame(width: node.size, height: node.size)
            }
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
                        .foregroundColor(Color.appTextPrimary)
                        .padding(4)
                        .background(Color.appBackground.opacity(0.9))
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
        .position(
            CGPoint(
                x: node.position.x + dragOffset.x,
                y: node.position.y + dragOffset.y
            )
        )
        .gesture(
            DragGesture()
                .onChanged { gesture in
                    if !isDraggingNode {
                        isDraggingNode = true
                        initialPosition = node.position
                    }
                    dragOffset = CGPoint(x: gesture.translation.width, y: gesture.translation.height)
                    onDrag(
                        CGPoint(
                            x: initialPosition.x + gesture.translation.width,
                            y: initialPosition.y + gesture.translation.height
                        )
                    )
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
            return Color.appTextTertiary
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