import Foundation

enum AnalysisType: String, CaseIterable, Identifiable, Codable, Equatable {
    case thinkingType = "thinkingType"
    case cognitiveStructure = "cognitiveStructure"
    case knowledgeDomain = "knowledgeDomain"
    case conceptConnection = "conceptConnection"
    case learningProgress = "learningProgress"
    
    var id: String {
        return rawValue
    }
    
    var displayName: String {
        switch self {
        case .thinkingType:
            return "思维类型分析"
        case .cognitiveStructure:
            return "认知结构分析"
        case .knowledgeDomain:
            return "知识领域分析"
        case .conceptConnection:
            return "概念关联分析"
        case .learningProgress:
            return "学习进度分析"
        }
    }
    
    var description: String {
        switch self {
        case .thinkingType:
            return "分析您的思维类型分布，帮助您了解自己的思考方式"
        case .cognitiveStructure:
            return "分析您的认知结构完整性和层次关系"
        case .knowledgeDomain:
            return "分析您的知识领域覆盖范围和深度"
        case .conceptConnection:
            return "分析您的概念之间的关联强度和网络结构"
        case .learningProgress:
            return "分析您的学习进度和认知发展趋势"
        }
    }
    
    var chartType: ChartType {
        switch self {
        case .thinkingType:
            return .radar
        case .cognitiveStructure:
            return .bar
        case .knowledgeDomain:
            return .pie
        case .conceptConnection:
            return .network
        case .learningProgress:
            return .line
        }
    }
}

