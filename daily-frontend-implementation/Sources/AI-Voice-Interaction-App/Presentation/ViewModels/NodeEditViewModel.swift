import SwiftUI

// 节点编辑ViewModel
class NodeEditViewModel: ObservableObject {
    // 基本属性
    @Published var isNew: Bool
    @Published var nodeId: String?
    @Published var nodeLabel: String = ""
    @Published var nodeType: VisualizationNodeType = .secondary
    @Published var nodeSize: CGFloat = 50
    @Published var nodeLevel: Int = 1
    @Published var nodeDescription: String = ""
    
    // 验证状态
    var isValid: Bool {
        !nodeLabel.isEmpty
    }
    
    // 初始化
    init(isNew: Bool, node: VisualizationNode? = nil) {
        self.isNew = isNew
        
        if let node = node {
            self.nodeId = node.id
            self.nodeLabel = node.label
            self.nodeType = node.type
            self.nodeSize = node.size
            self.nodeLevel = node.level
            self.nodeDescription = node.description
        }
    }
    
    // 保存节点
    func save() -> VisualizationNode {
        let node = VisualizationNode(
            id: nodeId ?? UUID().uuidString,
            label: nodeLabel,
            type: nodeType,
            position: CGPoint(x: 0, y: 0), // 位置将在主ViewModel中设置
            size: nodeSize,
            conceptId: UUID().uuidString,
            level: nodeLevel,
            description: nodeDescription
        )
        return node
    }
}
