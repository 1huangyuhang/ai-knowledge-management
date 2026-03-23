import SwiftUI

// 可视化底部控制栏组件
struct VisualizationControlBarView: View {
    @Binding var zoomLevel: CGFloat
    @Binding var viewType: VisualizationViewType
    @Binding var isMultiSelectMode: Bool
    var onZoomIn: () -> Void
    var onZoomOut: () -> Void
    var onReset: () -> Void
    var onToggleMultiSelect: () -> Void
    
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
                    .padding(8)
                    .background(viewType == .forceDirected ? .appPrimary.opacity(0.1) : .clear)
                    .cornerRadius(8)
                }
                
                Button(action: { viewType = .hierarchical }) {
                    VStack {
                        Image(systemName: "square.stack.3d.up")
                        Text("层次图")
                            .font(.caption)
                    }
                    .foregroundColor(viewType == .hierarchical ? .appPrimary : .appTextSecondary)
                    .padding(8)
                    .background(viewType == .hierarchical ? .appPrimary.opacity(0.1) : .clear)
                    .cornerRadius(8)
                }
                
                Button(action: { viewType = .network }) {
                    VStack {
                        Image(systemName: "network")
                        Text("网络拓扑")
                            .font(.caption)
                    }
                    .foregroundColor(viewType == .network ? .appPrimary : .appTextSecondary)
                    .padding(8)
                    .background(viewType == .network ? .appPrimary.opacity(0.1) : .clear)
                    .cornerRadius(8)
                }
                
                Spacer()
                
                // 多选模式切换
                Button(action: onToggleMultiSelect) {
                    VStack {
                        Image(systemName: isMultiSelectMode ? "checkmark.circle.fill" : "circle")
                        Text("多选")
                            .font(.caption)
                    }
                    .foregroundColor(isMultiSelectMode ? .appPrimary : .appTextSecondary)
                    .padding(8)
                    .background(isMultiSelectMode ? .appPrimary.opacity(0.1) : .clear)
                    .cornerRadius(8)
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
