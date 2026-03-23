import CoreGraphics

import CoreGraphics

// 可视化节点类型
enum VisualizationNodeType {
    case core
    case secondary
    case related
    case external
    
    var displayName: String {
        switch self {
        case .core:
            return "核心"
        case .secondary:
            return "次要"
        case .related:
            return "关联"
        case .external:
            return "外部"
        }
    }
}

// 可视化节点模型
struct VisualizationNode: Identifiable, Equatable {
    let id: String
    var label: String
    var type: VisualizationNodeType
    var position: CGPoint
    var size: CGFloat
    var velocity: CGPoint = .zero
    let conceptId: String
    var level: Int = 1
    var description: String = ""
    
    static func == (lhs: VisualizationNode, rhs: VisualizationNode) -> Bool {
        lhs.id == rhs.id
    }
}

// 可视化边类型
enum VisualizationEdgeType {
    case hierarchical
    case associative
    case causal
    case similarity
    
    var displayName: String {
        switch self {
        case .hierarchical:
            return "层级"
        case .associative:
            return "关联"
        case .causal:
            return "因果"
        case .similarity:
            return "相似"
        }
    }
}

// 可视化边模型
struct VisualizationEdge: Identifiable, Equatable {
    let id: String
    let sourceId: String
    let targetId: String
    var type: VisualizationEdgeType
    var thickness: CGFloat
    let relationId: String
    var description: String = ""
    
    static func == (lhs: VisualizationEdge, rhs: VisualizationEdge) -> Bool {
        lhs.id == rhs.id
    }
}

// 可视化视图类型
enum VisualizationViewType {
    case forceDirected
    case hierarchical
    case network
}

// 可视化配置
struct VisualizationConfiguration {
    var viewType: VisualizationViewType
    var zoomLevel: CGFloat
    var showLabels: Bool
    var showEdgeLabels: Bool
    var nodeSize: CGFloat
    var edgeThickness: CGFloat
    
    /// 默认配置
    static let `default` = VisualizationConfiguration(
        viewType: .forceDirected,
        zoomLevel: 1.0,
        showLabels: true,
        showEdgeLabels: false,
        nodeSize: 40.0,
        edgeThickness: 2.0
    )
}
