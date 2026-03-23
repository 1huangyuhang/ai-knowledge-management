//
//  CognitiveModelVisualizationViewModel.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation
import Combine

// 编辑模式枚举
enum EditMode {
    case select
    case node
    case relation
}

// 模型修改记录
enum ModelChange {
    case addNode(VisualizationNode)
    case updateNode(VisualizationNode)
    case deleteNode(String)
    case addEdge(VisualizationEdge)
    case updateEdge(VisualizationEdge)
    case deleteEdge(String)
}

class CognitiveModelVisualizationViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published var nodes: [VisualizationNode] = []
    @Published var edges: [VisualizationEdge] = []
    @Published var selectedNodeId: String? = nil
    @Published var selectedNodeIds: Set<String> = []
    @Published var isMultiSelectMode: Bool = false
    @Published var isAnimating: Bool = false
    @Published var configuration: VisualizationConfiguration = .default
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var isConnected: Bool = false
    
    // 编辑状态
    @Published var isEditing: Bool = false
    @Published var editMode: EditMode = .select
    @Published var showNodeEditForm: Bool = false
    @Published var showRelationEditForm: Bool = false
    @Published var selectedSourceNodeId: String? = nil
    @Published var selectedTargetNodeId: String? = nil
    
    // 编辑用ViewModel
    @Published var nodeEditViewModel: NodeEditViewModel? = nil
    
    // WebSocket服务
    private let webSocketService: WebSocketServiceProtocol?
    private var cancellables = Set<AnyCancellable>()
    @Published var relationEditViewModel: RelationEditViewModel? = nil
    
    // 本地修改记录
    @Published var localChanges: [ModelChange] = []
    
    // MARK: - Private Properties
    
    private let layoutEngine: LayoutEngineProtocol
    private var animationTimer: Timer?
    
    // MARK: - Initialization
    
    init() {
        // 初始化所有存储属性
        self.layoutEngine = ForceDirectedLayout()
        self.webSocketService = nil // 添加默认值
        self.cancellables = Set<AnyCancellable>()
        self.animationTimer = nil // 添加默认值
        
        // 初始化完成后，才能使用self
        
        // Subscribe to configuration changes to update layout
        $configuration
            .sink { [weak self] newConfig in
                self?.recalculateLayout()
            }
            .store(in: &cancellables)
        
        // Load mock data for demonstration
        loadMockData()
    }
    
    // MARK: - Public Methods
    
    func recalculateLayout() {
        switch configuration.viewType {
        case .forceDirected:
            applyForceDirectedLayout()
        case .hierarchical:
            applyHierarchicalLayout()
        case .network:
            applyNetworkLayout()
        }
    }
    
    // MARK: - Edit Methods
    
    // 添加新节点
    func addNode() {
        nodeEditViewModel = NodeEditViewModel(isNew: true)
        showNodeEditForm = true
    }
    
    // 编辑节点
    func editNode(_ nodeId: String) {
        if let node = nodes.first(where: { $0.id == nodeId }) {
            nodeEditViewModel = NodeEditViewModel(isNew: false, node: node)
            showNodeEditForm = true
        }
    }
    
    // 保存节点
    func saveNode() {
        guard let viewModel = nodeEditViewModel else { return }
        
        let node = viewModel.save()
        
        if viewModel.isNew {
            // 创建新节点，设置默认位置
            var newNode = node
            newNode.position = CGPoint(x: 0, y: 0) // 默认位置，会在布局中调整
            
            nodes.append(newNode)
            localChanges.append(.addNode(newNode))
        } else {
            // 更新现有节点
            if let nodeId = viewModel.nodeId, let index = nodes.firstIndex(where: { $0.id == nodeId }) {
                var updatedNode = nodes[index]
                updatedNode.label = viewModel.nodeLabel
                updatedNode.type = viewModel.nodeType
                updatedNode.size = viewModel.nodeSize
                updatedNode.level = viewModel.nodeLevel
                updatedNode.description = viewModel.nodeDescription
                
                nodes[index] = updatedNode
                localChanges.append(.updateNode(updatedNode))
            }
        }
        
        showNodeEditForm = false
        nodeEditViewModel = nil
        
        // 重新计算布局
        recalculateLayout()
    }
    
    // 添加新关系
    func addRelation() {
        // 如果已经选择了源节点，直接创建关系编辑ViewModel
        if let sourceNodeId = selectedSourceNodeId {
            relationEditViewModel = RelationEditViewModel(isNew: true)
            relationEditViewModel?.sourceNodeId = sourceNodeId
            relationEditViewModel?.sourceNodeLabel = nodes.first(where: { $0.id == sourceNodeId })?.label ?? ""
            showRelationEditForm = true
        } else {
            // 否则进入选择源节点模式
            editMode = .relation
        }
    }
    
    // 选择关系源节点
    func selectRelationSource(_ nodeId: String) {
        if editMode == .relation {
            selectedSourceNodeId = nodeId
        }
    }
    
    // 选择关系目标节点
    func selectRelationTarget(_ nodeId: String) {
        if editMode == .relation, let sourceNodeId = selectedSourceNodeId, sourceNodeId != nodeId {
            selectedTargetNodeId = nodeId
            
            // 创建关系编辑ViewModel
            relationEditViewModel = RelationEditViewModel(isNew: true)
            relationEditViewModel?.sourceNodeId = sourceNodeId
            relationEditViewModel?.targetNodeId = nodeId
            relationEditViewModel?.sourceNodeLabel = nodes.first(where: { $0.id == sourceNodeId })?.label ?? ""
            relationEditViewModel?.targetNodeLabel = nodes.first(where: { $0.id == nodeId })?.label ?? ""
            
            showRelationEditForm = true
            editMode = .select
            selectedSourceNodeId = nil
            selectedTargetNodeId = nil
        }
    }
    
    // 保存关系
    func saveRelation() {
        guard let viewModel = relationEditViewModel, let _ = viewModel.sourceNodeId, let _ = viewModel.targetNodeId else { return }
        
        let edge = viewModel.save()
        
        if viewModel.isNew {
            // 创建新关系
            edges.append(edge)
            localChanges.append(.addEdge(edge))
        } else {
            // 更新现有关系
            if let relationId = viewModel.relationId, let index = edges.firstIndex(where: { $0.id == relationId }) {
                var updatedEdge = edges[index]
                updatedEdge.type = viewModel.relationType
                updatedEdge.thickness = viewModel.relationStrength / 2
                updatedEdge.description = viewModel.relationDescription
                
                edges[index] = updatedEdge
                localChanges.append(.updateEdge(updatedEdge))
            }
        }
        
        showRelationEditForm = false
        relationEditViewModel = nil
        
        // 重新计算布局
        recalculateLayout()
    }
    
    // 删除关系
    func deleteRelation(_ edgeId: String) {
        edges.removeAll { $0.id == edgeId }
        localChanges.append(.deleteEdge(edgeId))
        
        // 重新计算布局
        recalculateLayout()
    }
    
    // 取消编辑
    func cancelEdit() {
        showNodeEditForm = false
        showRelationEditForm = false
        nodeEditViewModel = nil
        relationEditViewModel = nil
        selectedSourceNodeId = nil
        selectedTargetNodeId = nil
        editMode = .select
    }
    
    // 保存所有修改
    func saveAllChanges() {
        // TODO: 实现API调用，提交本地修改到服务器
        // 目前只清空本地修改记录，关闭编辑模式
        localChanges.removeAll()
        isEditing = false
    }
    
    // 取消所有修改
    func cancelAllChanges() {
        // 重新加载模型数据
        loadMockData()
        // 清空本地修改记录
        localChanges.removeAll()
        // 关闭编辑模式
        isEditing = false
    }
    
    func updateNodePosition(_ nodeId: String, newPosition: CGPoint) {
        if let index = nodes.firstIndex(where: { $0.id == nodeId }) {
            nodes[index].position = newPosition
        }
    }
    
    func loadModel(modelId: String) {
        // TODO: Implement actual API call to load cognitive model data
        isLoading = true
        errorMessage = nil
        
        // Simulate API call with mock data
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.loadMockData()
            self.isLoading = false
        }
    }
    
    func resetView() {
        configuration.zoomLevel = 1.0
        selectedNodeId = nil
        selectedNodeIds.removeAll()
        isMultiSelectMode = false
        
        // Recalculate layout
        recalculateLayout()
    }
    
    func zoomIn() {
        configuration.zoomLevel = min(3.0, configuration.zoomLevel + 0.1)
    }
    
    func zoomOut() {
        configuration.zoomLevel = max(0.1, configuration.zoomLevel - 0.1)
    }
    
    // MARK: - Multi-select and Batch Operations
    
    func toggleMultiSelectMode() {
        isMultiSelectMode = !isMultiSelectMode
        if !isMultiSelectMode {
            selectedNodeIds.removeAll()
            selectedNodeId = nil
        }
    }
    
    func toggleNodeSelection(_ nodeId: String) {
        if isMultiSelectMode {
            if selectedNodeIds.contains(nodeId) {
                selectedNodeIds.remove(nodeId)
            } else {
                selectedNodeIds.insert(nodeId)
            }
            selectedNodeId = nil
        } else {
            selectedNodeIds = [nodeId]
            selectedNodeId = nodeId
        }
    }
    
    func clearSelection() {
        selectedNodeIds.removeAll()
        selectedNodeId = nil
    }
    
    func deleteSelectedNodes() {
        // Batch delete nodes logic
        for nodeId in selectedNodeIds {
            deleteNode(nodeId)
        }
        selectedNodeIds.removeAll()
        selectedNodeId = nil
        
        // Recalculate layout after deletion
        recalculateLayout()
    }
    
    func deleteNode(_ nodeId: String) {
        // Delete single node logic
        nodes.removeAll { $0.id == nodeId }
        // 删除关联的边
        let edgesToDelete = edges.filter { $0.sourceId == nodeId || $0.targetId == nodeId }
        for edge in edgesToDelete {
            deleteRelation(edge.id)
        }
        // 记录节点删除
        localChanges.append(.deleteNode(nodeId))
    }
    
    // MARK: - Private Methods
    
    private func loadMockData() {
        // Create mock nodes
        let coreNode = VisualizationNode(
            id: "node_core_1",
            label: "人工智能",
            type: .core,
            position: CGPoint(x: 0, y: 0),
            size: 60,
            conceptId: "core-1"
        )
        
        let secondaryNodes = [
            VisualizationNode(
                id: "node_sec_1",
                label: "机器学习",
                type: .secondary,
                position: CGPoint(x: 150, y: -100),
                size: 50,
                conceptId: "sec-1"
            ),
            VisualizationNode(
                id: "node_sec_2",
                label: "深度学习",
                type: .secondary,
                position: CGPoint(x: 150, y: 100),
                size: 50,
                conceptId: "sec-2"
            ),
            VisualizationNode(
                id: "node_sec_3",
                label: "自然语言处理",
                type: .secondary,
                position: CGPoint(x: -150, y: -100),
                size: 50,
                conceptId: "sec-3"
            ),
            VisualizationNode(
                id: "node_sec_4",
                label: "计算机视觉",
                type: .secondary,
                position: CGPoint(x: -150, y: 100),
                size: 50,
                conceptId: "sec-4"
            )
        ]
        
        let relatedNodes = [
            VisualizationNode(
                id: "node_rel_1",
                label: "神经网络",
                type: .related,
                position: CGPoint(x: 300, y: -150),
                size: 40,
                conceptId: "rel-1"
            ),
            VisualizationNode(
                id: "node_rel_2",
                label: "卷积神经网络",
                type: .related,
                position: CGPoint(x: 300, y: 150),
                size: 40,
                conceptId: "rel-2"
            ),
            VisualizationNode(
                id: "node_rel_3",
                label: "循环神经网络",
                type: .related,
                position: CGPoint(x: -300, y: -150),
                size: 40,
                conceptId: "rel-3"
            ),
            VisualizationNode(
                id: "node_rel_4",
                label: "生成对抗网络",
                type: .related,
                position: CGPoint(x: -300, y: 150),
                size: 40,
                conceptId: "rel-4"
            )
        ]
        
        // Combine all nodes
        let allNodes = [coreNode] + secondaryNodes + relatedNodes
        
        // Create mock edges
        let edges = [
            // Core to secondary relationships
            VisualizationEdge(
                id: "edge_1",
                sourceId: coreNode.id,
                targetId: secondaryNodes[0].id,
                type: .hierarchical,
                thickness: 2.0,
                relationId: "rel_1"
            ),
            VisualizationEdge(
                id: "edge_2",
                sourceId: coreNode.id,
                targetId: secondaryNodes[1].id,
                type: .hierarchical,
                thickness: 2.0,
                relationId: "rel_2"
            ),
            VisualizationEdge(
                id: "edge_3",
                sourceId: coreNode.id,
                targetId: secondaryNodes[2].id,
                type: .hierarchical,
                thickness: 2.0,
                relationId: "rel_3"
            ),
            VisualizationEdge(
                id: "edge_4",
                sourceId: coreNode.id,
                targetId: secondaryNodes[3].id,
                type: .hierarchical,
                thickness: 2.0,
                relationId: "rel_4"
            ),
            
            // Secondary to related relationships
            VisualizationEdge(
                id: "edge_5",
                sourceId: secondaryNodes[0].id,
                targetId: relatedNodes[0].id,
                type: .hierarchical,
                thickness: 1.5,
                relationId: "rel_5"
            ),
            VisualizationEdge(
                id: "edge_6",
                sourceId: secondaryNodes[1].id,
                targetId: relatedNodes[1].id,
                type: .hierarchical,
                thickness: 1.5,
                relationId: "rel_6"
            ),
            VisualizationEdge(
                id: "edge_7",
                sourceId: secondaryNodes[2].id,
                targetId: relatedNodes[2].id,
                type: .hierarchical,
                thickness: 1.5,
                relationId: "rel_7"
            ),
            VisualizationEdge(
                id: "edge_8",
                sourceId: secondaryNodes[1].id,
                targetId: relatedNodes[3].id,
                type: .hierarchical,
                thickness: 1.5,
                relationId: "rel_8"
            ),
            
            // Cross relationships
            VisualizationEdge(
                id: "edge_9",
                sourceId: secondaryNodes[0].id,
                targetId: secondaryNodes[1].id,
                type: .similarity,
                thickness: 1.0,
                relationId: "rel_9"
            ),
            VisualizationEdge(
                id: "edge_10",
                sourceId: secondaryNodes[2].id,
                targetId: secondaryNodes[3].id,
                type: .similarity,
                thickness: 1.0,
                relationId: "rel_10"
            )
        ]
        
        // Update published properties
        self.nodes = allNodes
        self.edges = edges
        
        // Calculate initial layout
        recalculateLayout()
    }
    
    private func applyForceDirectedLayout() {
        // Stop any existing animation
        animationTimer?.invalidate()
        
        // Start force directed layout animation
        animationTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            self.nodes = self.layoutEngine.calculateLayout(nodes: self.nodes, edges: self.edges)
        }
    }
    
    private func applyHierarchicalLayout() {
        // Stop any existing animation
        animationTimer?.invalidate()
        
        // Apply hierarchical layout
        nodes = layoutEngine.calculateLayout(nodes: nodes, edges: edges)
    }
    
    private func applyNetworkLayout() {
        // Stop any existing animation
        animationTimer?.invalidate()
        
        // Apply network layout
        nodes = layoutEngine.calculateLayout(nodes: nodes, edges: edges)
    }
    
    deinit {
        // Clean up timer
        animationTimer?.invalidate()
    }
}
