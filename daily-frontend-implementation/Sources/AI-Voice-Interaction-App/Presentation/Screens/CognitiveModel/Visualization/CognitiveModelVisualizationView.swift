// 认知模型可视化主页面
import SwiftUI
import UIKit

struct CognitiveModelVisualizationView: View {
    @EnvironmentObject var appRouter: AppNavigator
    @StateObject private var viewModel = CognitiveModelVisualizationViewModel()
    @State private var showNodeDetail = false
    @State private var selectedNodeForDetail: VisualizationNode?
    
    var body: some View {
        NavigationStack(path: $appRouter.path) {
            VStack(spacing: 0) {
                // 顶部导航栏
                VisualizationTopBarView()
                .background(Color(UIColor.systemBackground))
                
                // 主要内容区域
                ZStack {
                    // 可视化画布
                    VisualizationCanvasView(
                        nodes: $viewModel.nodes,
                        edges: $viewModel.edges,
                        selectedNodeId: $viewModel.selectedNodeId,
                        editMode: $viewModel.editMode,
                        selectedSourceNodeId: $viewModel.selectedSourceNodeId,
                        onSelectNode: { nodeId in
                            if viewModel.isEditing {
                                // 编辑模式下的节点选择逻辑
                                if viewModel.editMode == .relation {
                                    if viewModel.selectedSourceNodeId == nil {
                                        viewModel.selectRelationSource(nodeId)
                                    } else {
                                        viewModel.selectRelationTarget(nodeId)
                                    }
                                } else {
                                    viewModel.selectedNodeId = nodeId
                                }
                            } else {
                                // 非编辑模式下查看节点详情
                                if let node = viewModel.nodes.first(where: { $0.id == nodeId }) {
                                    selectedNodeForDetail = node
                                    showNodeDetail = true
                                }
                            }
                        },
                        onDoubleTapNode: { nodeId in
                            if viewModel.isEditing {
                                viewModel.editNode(nodeId)
                            }
                        }
                    )
                    
                    // 底部控制栏
                    VStack {
                        Spacer()
                        VisualizationControlBarView(
                            zoomLevel: $viewModel.configuration.zoomLevel,
                            viewType: $viewModel.configuration.viewType,
                            isMultiSelectMode: $viewModel.isMultiSelectMode,
                            onZoomIn: { viewModel.zoomIn() },
                            onZoomOut: { viewModel.zoomOut() },
                            onReset: { viewModel.resetView() },
                            onToggleMultiSelect: { viewModel.toggleMultiSelectMode() }
                        )
                    }
                    
                    // 图例
                    VisualizationLegendView()
                        .position(x: 100, y: 100)
                    
                    // 编辑控制面板
                    if viewModel.isEditing {
                        VisualizationEditControlView(
                            isEditing: $viewModel.isEditing,
                            editMode: $viewModel.editMode,
                            onAddNode: { viewModel.addNode() },
                            onAddRelation: { viewModel.addRelation() },
                            onEdit: { 
                                if let selectedNodeId = viewModel.selectedNodeId {
                                    viewModel.editNode(selectedNodeId)
                                }
                            },
                            onDelete: { 
                                if let selectedNodeId = viewModel.selectedNodeId {
                                    viewModel.deleteNode(selectedNodeId)
                                }
                            },
                            onSave: { viewModel.saveAllChanges() },
                            onCancel: { viewModel.cancelAllChanges() },
                            hasSelection: viewModel.selectedNodeId != nil
                        )
                        .position(x: 100, y: 100)
                    }
                }
                .background(Color(UIColor.secondarySystemBackground))
                .sheet(isPresented: $showNodeDetail) { 
                    if let node = selectedNodeForDetail {
                        NodeDetailView(
                            node: node,
                            onClose: { showNodeDetail = false },
                            onEdit: { 
                                showNodeDetail = false
                                viewModel.editNode(node.id)
                            },
                            onDelete: { 
                                showNodeDetail = false
                                viewModel.deleteNode(node.id)
                            },
                            onViewConcept: { 
                                showNodeDetail = false
                                // TODO: 实现查看概念功能
                            }
                        )
                    }
                }
                // 节点编辑表单
                .sheet(isPresented: $viewModel.showNodeEditForm) { 
                    if let viewModel = viewModel.nodeEditViewModel {
                        NodeEditFormView(
                            viewModel: viewModel,
                            onSave: { _ in self.viewModel.saveNode() },
                            onCancel: { self.viewModel.cancelEdit() }
                        )
                    }
                }
                // 关系编辑表单
                .sheet(isPresented: $viewModel.showRelationEditForm) { 
                    if let viewModel = viewModel.relationEditViewModel {
                        RelationEditFormView(
                            viewModel: viewModel,
                            onSave: { _ in self.viewModel.saveRelation() },
                            onCancel: { self.viewModel.cancelEdit() }
                        )
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
}
