import Foundation

/// 认知关系类型枚举
enum CognitiveRelationType: String, Decodable {
    case isA = "is_a"
    case hasA = "has_a"
    case partOf = "part_of"
    case relatedTo = "related_to"
    case causes = "causes"
    case implies = "implies"
    case similarity = "similarity"
    case difference = "difference"
    case dependency = "dependency"
    case hierarchy = "hierarchy"
    case association = "association"
    case other = "other"
}

/// 认知概念模型
struct CognitiveConcept: Decodable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let importance: Double
    let type: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case importance
        case type
        case createdAt = "created_at"
    }
    
    static func == (lhs: CognitiveConcept, rhs: CognitiveConcept) -> Bool {
        return lhs.id == rhs.id
    }
}

/// 认知关系模型
struct CognitiveRelation: Decodable, Identifiable, Equatable {
    let id: String
    let sourceId: String
    let targetId: String
    let type: CognitiveRelationType
    let strength: Double
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case sourceId = "source_id"
        case targetId = "target_id"
        case type
        case strength
        case createdAt = "created_at"
    }
    
    static func == (lhs: CognitiveRelation, rhs: CognitiveRelation) -> Bool {
        return lhs.id == rhs.id
    }
}

/// 认知模型模型
struct CognitiveModel: Decodable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let concepts: [CognitiveConcept]
    let relations: [CognitiveRelation]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case concepts
        case relations
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    static func == (lhs: CognitiveModel, rhs: CognitiveModel) -> Bool {
        return lhs.id == rhs.id
    }
}

/// 认知模型创建请求
struct CognitiveModelCreateRequest: Encodable {
    let name: String
    let description: String?
}

/// 认知模型更新请求
struct CognitiveModelUpdateRequest: Encodable {
    let name: String?
    let description: String?
}