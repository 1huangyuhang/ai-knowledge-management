import SwiftUI

/// 可视化编辑控制面板
struct VisualizationEditControlView: View {
    @Binding var isEditing: Bool
    @Binding var editMode: EditMode
    var onAddNode: () -> Void
    var onAddRelation: () -> Void
    var onEdit: () -> Void
    var onDelete: () -> Void
    var onSave: () -> Void
    var onCancel: () -> Void
    var hasSelection: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            // 编辑模式切换
            HStack(spacing: 8) {
                EditModeToggleButton(
                    editMode: $editMode,
                    targetMode: .select,
                    icon: "cursorarrow",
                    label: "选择"
                )
                
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
                    .disabled(!hasSelection)
                    
                    Button(action: onDelete) {
                        Label("删除", systemImage: "trash")
                            .font(.caption)
                    }
                    .buttonStyle(DangerButtonStyle())
                    .disabled(!hasSelection)
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
        .background(Color.appBackground)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(width: 200)
    }
    
    // 编辑模式切换按钮组件
    struct EditModeToggleButton<Mode: Hashable>: View {
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
                .foregroundColor(editMode == targetMode ? Color.appPrimary : Color.appTextSecondary)
                .padding(6)
                .background(editMode == targetMode ? Color.appPrimary.opacity(0.1) : .clear)
                .cornerRadius(6)
                .frame(maxWidth: .infinity)
            }
        }
    }
}