// 可视化顶部导航栏组件
import SwiftUI

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
