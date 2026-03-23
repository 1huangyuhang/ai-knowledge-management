import SwiftUI

// 关系编辑ViewModel
class RelationEditViewModel: ObservableObject {
    // 基本属性
    @Published var isNew: Bool
    @Published var relationId: String?
    @Published var relationType: VisualizationEdgeType = .associative
    @Published var relationStrength: CGFloat = 5.0
    @Published var isDirected: Bool = true
    @Published var relationDescription: String = ""
    
    // 节点信息
    @Published var sourceNodeId: String?
    @Published var targetNodeId: String?
    @Published var sourceNodeLabel: String = ""
    @Published var targetNodeLabel: String = ""
    
    // 初始化
    init(isNew: Bool, edge: VisualizationEdge? = nil, sourceNodeLabel: String = "", targetNodeLabel: String = "") {
        self.isNew = isNew
        self.sourceNodeLabel = sourceNodeLabel
        self.targetNodeLabel = targetNodeLabel
        
        if let edge = edge {
            self.relationId = edge.id
            self.relationType = edge.type
            self.relationStrength = edge.thickness * 2
            self.isDirected = true // 默认有方向
            self.relationDescription = edge.description
            
            self.sourceNodeId = edge.sourceId
            self.targetNodeId = edge.targetId
        }
    }
    
    // 保存关系
    func save() -> VisualizationEdge {
        let edge = VisualizationEdge(
            id: relationId ?? UUID().uuidString,
            sourceId: sourceNodeId ?? "",
            targetId: targetNodeId ?? "",
            type: relationType,
            thickness: relationStrength / 2,
            relationId: UUID().uuidString,
            description: relationDescription
        )
        return edge
    }
}
