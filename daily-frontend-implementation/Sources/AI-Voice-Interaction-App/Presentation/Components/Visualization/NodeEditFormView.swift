import SwiftUI

struct NodeEditFormView: View {
    @ObservedObject var viewModel: NodeEditViewModel
    var onSave: (VisualizationNode) -> Void
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
                        ForEach([VisualizationNodeType.core, .secondary, .related, .external], id: \.self) {
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
                    let node = viewModel.save()
                    onSave(node)
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
