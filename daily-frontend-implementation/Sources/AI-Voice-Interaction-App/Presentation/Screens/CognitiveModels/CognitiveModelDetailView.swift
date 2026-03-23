import SwiftUI

/// 认知模型详情视图
struct CognitiveModelDetailView: View {
    /// 视图模型
    @StateObject private var viewModel: CognitiveModelDetailViewModel
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    
    /// 初始化
    /// - Parameter modelId: 模型ID
    init(modelId: UUID) {
        _viewModel = StateObject(wrappedValue: CognitiveModelDetailViewModel(modelId: modelId))
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // 模型基本信息
                if let model = viewModel.model {
                    ModelHeaderView(model: model)
                }
                
                // 错误提示
                if let errorMessage = viewModel.errorMessage {
                    ErrorBanner(message: errorMessage) {
                        Task {
                            await viewModel.refreshModelDetail()
                        }
                    }
                }
                
                // 选项卡
                TabBarView(
                    activeTab: viewModel.activeTab,
                    tabs: CognitiveModelDetailViewModel.DetailTab.allCases,
                    onTabTap: viewModel.toggleTab
                )
                
                // 内容区域
                ScrollView {
                    if viewModel.isLoading {
                        // 加载中状态
                        LoadingView()
                    } else if let model = viewModel.model {
                        // 根据选项卡显示不同内容
                        switch viewModel.activeTab {
                        case .concepts:
                            ConceptsListView(
                                concepts: viewModel.concepts,
                                onDelete: { concept in
                                    Task {
                                        await viewModel.deleteConcept(concept)
                                    }
                                }
                            )
                        case .relations:
                            RelationsListView(
                                relations: viewModel.relations,
                                concepts: viewModel.concepts,
                                onDelete: { relation in
                                    Task {
                                        await viewModel.deleteRelation(relation)
                                    }
                                }
                            )
                        case .analysis:
                            AnalysisView(model: model)
                        }
                    }
                }
                .background(Color(.systemBackground))
            }
            .navigationTitle("模型详情")
            .toolbar {
                // 编辑按钮
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        // 导航到编辑页面
                    }) {
                        Image(systemName: "pencil")
                            .font(.title2)
                    }
                }
                
                // 删除按钮
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(role: .destructive, action: {
                        // 显示删除确认对话框
                        showDeleteConfirmation()
                    }) {
                        Image(systemName: "trash")
                            .font(.title2)
                    }
                }
            }
            .onAppear {
                Task {
                    await viewModel.fetchModelDetail()
                }
            }
            .refreshable {
                await viewModel.refreshModelDetail()
            }
        }
    }
    
    /// 显示删除确认对话框
    private func showDeleteConfirmation() {
        // 实现删除确认对话框
        // 这里简化处理，实际应用中需要实现完整的确认逻辑
        Task {
            do {
                try await CognitiveModelService().deleteModel(id: viewModel.modelId.uuidString)
                // 删除成功后返回上一页
                navigator.pop()
            } catch {
                // 处理删除失败
                viewModel.errorMessage = "删除模型失败，请重试"
            }
        }
    }
}

/// 模型头部信息视图
struct ModelHeaderView: View {
    let model: CognitiveModel
    
    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                // 模型名称
                Text(model.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                // 模型描述
                if let description = model.description, !description.isEmpty {
                    Text(description)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineLimit(nil)
                }
                
                // 统计信息
                HStack(spacing: 24) {
                    // 概念数量
                    VStack(alignment: .leading, spacing: 4) {
                        Text("概念数量")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(model.concepts?.count ?? 0)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    
                    // 关系数量
                    VStack(alignment: .leading, spacing: 4) {
                        Text("关系数量")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(model.relations?.count ?? 0)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    
                    Spacer()
                }
                
                // 创建时间和更新时间
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("创建时间：")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(model.createdAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("更新时间：")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(model.updatedAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(16)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

/// 选项卡视图
struct TabBarView: View {
    /// 当前选中的选项卡
    let activeTab: CognitiveModelDetailViewModel.DetailTab
    /// 选项卡列表
    let tabs: [CognitiveModelDetailViewModel.DetailTab]
    /// 选项卡点击回调
    let onTabTap: (CognitiveModelDetailViewModel.DetailTab) -> Void
    
    var body: some View {
        HStack {
            ForEach(tabs, id: \.self) {
                TabItemView(
                    tab: $0,
                    isActive: activeTab == $0,
                    onTap: {
                        onTabTap($0)
                    }
                )
            }
        }
        .background(Color(.systemBackground))
        .border(.gray.opacity(0.2), width: 1)
    }
}

/// 选项卡项视图
struct TabItemView: View {
    /// 选项卡
    let tab: CognitiveModelDetailViewModel.DetailTab
    /// 是否激活
    let isActive: Bool
    /// 点击回调
    let onTap: (CognitiveModelDetailViewModel.DetailTab) -> Void
    
    var body: some View {
        Button(action: { onTap(tab) }) {
            VStack(spacing: 4) {
                Text(tab.title)
                    .font(.body)
                    .fontWeight(isActive ? .bold : .regular)
                    .foregroundColor(isActive ? .primary : .secondary)
                
                if isActive {
                    Rectangle()
                        .frame(height: 2)
                        .background(Color.primary)
                        .cornerRadius(1)
                } else {
                    Rectangle()
                        .frame(height: 2)
                        .background(Color.clear)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}

/// 概念列表视图
struct ConceptsListView: View {
    /// 概念列表
    let concepts: [CognitiveConcept]
    /// 删除概念回调
    let onDelete: (CognitiveConcept) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            if concepts.isEmpty {
                // 空状态
                EmptyStateView(
                    title: "暂无概念",
                    subtitle: "该认知模型尚未添加任何概念",
                    action: {},
                    actionTitle: "添加概念"
                )
                .padding(.vertical, 32)
            } else {
                // 概念列表
                ForEach(concepts) { concept in
                    ConceptItemView(
                        concept: concept,
                        onDelete: {
                            onDelete(concept)
                        }
                    )
                }
            }
        }
        .padding(16)
    }
}

/// 概念项视图
struct ConceptItemView: View {
    /// 概念
    let concept: CognitiveConcept
    /// 删除概念回调
    let onDelete: () -> Void
    
    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(concept.name)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        if let description = concept.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer()
                    
                    Menu {
                        Button("编辑") {
                            // 导航到编辑页面
                        }
                        Button("删除", role: .destructive) {
                            onDelete()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(.secondary)
                            .font(.title2)
                    }
                }
                
                HStack {
                    // 概念类型
                    HStack(spacing: 4) {
                        Text(concept.type)
                            .font(.caption)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    
                    // 概念权重
                    HStack(spacing: 4) {
                        Text("重要性：\(concept.importance)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(concept.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
    }
}

/// 关系列表视图
struct RelationsListView: View {
    /// 关系列表
    let relations: [CognitiveRelation]
    /// 概念列表
    let concepts: [CognitiveConcept]
    /// 删除关系回调
    let onDelete: (CognitiveRelation) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            if relations.isEmpty {
                // 空状态
                EmptyStateView(
                    title: "暂无关系",
                    subtitle: "该认知模型尚未添加任何关系",
                    action: {},
                    actionTitle: "添加关系"
                )
                .padding(.vertical, 32)
            } else {
                // 关系列表
                ForEach(relations) { relation in
                    RelationItemView(
                        relation: relation,
                        concepts: concepts,
                        onDelete: {
                            onDelete(relation)
                        }
                    )
                }
            }
        }
        .padding(16)
    }
}

/// 关系项视图
struct RelationItemView: View {
    /// 关系
    let relation: CognitiveRelation
    /// 概念列表
    let concepts: [CognitiveConcept]
    /// 删除关系回调
    let onDelete: () -> Void
    
    /// 源概念名称
    private var sourceConceptName: String {
        concepts.first { $0.id == relation.sourceConceptId }?.name ?? "未知概念"
    }
    
    /// 目标概念名称
    private var targetConceptName: String {
        concepts.first { $0.id == relation.targetConceptId }?.name ?? "未知概念"
    }
    
    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 8) {
                // 关系描述
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            // 源概念
                            Text(sourceConceptName)
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            // 关系箭头
                            Image(systemName: "arrow.right")
                                .foregroundColor(.secondary)
                            
                            // 目标概念
                            Text(targetConceptName)
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                        }
                        
                        if let description = relation.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer()
                    
                    Menu {
                        Button("编辑") {
                            // 导航到编辑页面
                        }
                        Button("删除", role: .destructive) {
                            onDelete()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(.secondary)
                            .font(.title2)
                    }
                }
                
                HStack {
                    // 关系类型
                    HStack(spacing: 4) {
                        Text(relation.type.displayName)
                            .font(.caption)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                    
                    // 关系权重
                    HStack(spacing: 4) {
                        Text("强度：\(relation.strength)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(relation.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
    }
}

/// 分析视图
struct AnalysisView: View {
    /// 模型
    let model: CognitiveModel
    
    var body: some View {
        VStack(spacing: 16) {
            Text("模型分析功能正在开发中...")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(32)
        }
        .padding(16)
    }
}

/// 加载视图
struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("加载中...")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }
}
