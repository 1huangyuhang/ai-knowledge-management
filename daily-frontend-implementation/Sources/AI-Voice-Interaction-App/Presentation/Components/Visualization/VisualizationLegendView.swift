import SwiftUI

/// 可视化图例视图
struct VisualizationLegendView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("图例")
                .font(.headline)
                .foregroundColor(Color.appTextPrimary)
                .padding(.bottom, 4)
            
            // 节点类型图例
            VStack(alignment: .leading, spacing: 6) {
                Text("节点类型")
                    .font(.subheadline)
                    .foregroundColor(Color.appTextPrimary)
                
                HStack(spacing: 12) {
                    LegendItem(
                        color: Color.appPrimary,
                        label: "核心概念"
                    )
                    
                    LegendItem(
                        color: Color.appSecondary,
                        label: "衍生概念"
                    )
                }
            }
            
            Divider()
            
            // 关系类型图例
            VStack(alignment: .leading, spacing: 6) {
                Text("关系类型")
                    .font(.subheadline)
                    .foregroundColor(Color.appTextPrimary)
                
                VStack(spacing: 4) {
                    LegendItem(
                        color: Color.appPrimary,
                        label: "层次关系",
                        lineStyle: .solid
                    )
                    
                    LegendItem(
                        color: Color.appSecondary,
                        label: "关联关系",
                        lineStyle: .dashed
                    )
                    
                    LegendItem(
                        color: Color.appAccent,
                        label: "因果关系",
                        lineStyle: .solid
                    )
                    
                    LegendItem(
                        color: Color.appSuccess,
                        label: "相似关系",
                        lineStyle: .solid
                    )
                }
            }
        }
        .padding()
        .background(Color.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(width: 200)
    }
    
    // 图例项组件
    struct LegendItem: View {
        let color: Color
        let label: String
        var lineStyle: LineStyle = .none
        
        var body: some View {
            HStack(spacing: 6) {
                if lineStyle != .none {
                    // 线样式图例
                    ZStack {
                        Rectangle()
                            .fill(Color.clear)
                            .frame(width: 20, height: 2)
                        
                        Path {
                            $0.move(to: CGPoint(x: 0, y: 1))
                            $0.addLine(to: CGPoint(x: 20, y: 1))
                        }
                        .stroke(
                            color,
                            style: StrokeStyle(
                                lineWidth: 2,
                                dash: lineStyle == .dashed ? [5, 3] : []
                            )
                        )
                    }
                } else {
                    // 颜色块图例
                    Circle()
                        .fill(color)
                        .frame(width: 12, height: 12)
                }
                
                Text(label)
                    .font(.caption)
                    .foregroundColor(Color.appTextPrimary)
            }
        }
        
        // 线样式枚举
        enum LineStyle {
            case none
            case solid
            case dashed
        }
    }
}