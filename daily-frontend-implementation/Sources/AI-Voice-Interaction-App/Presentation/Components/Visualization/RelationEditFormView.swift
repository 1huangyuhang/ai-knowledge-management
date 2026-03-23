import SwiftUI

struct RelationEditFormView: View {
    @ObservedObject var viewModel: RelationEditViewModel
    var onSave: (VisualizationEdge) -> Void
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
                        ForEach([VisualizationEdgeType.associative, .hierarchical, .causal, .similarity], id: \.self) {
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
                    let edge = viewModel.save()
                    onSave(edge)
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
