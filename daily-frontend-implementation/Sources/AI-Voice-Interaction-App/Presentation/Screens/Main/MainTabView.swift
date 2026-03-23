import SwiftUI

/// 主标签页视图
struct MainTabView: View {
    /// 状态管理
    @StateObject private var authViewModel = AuthViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // 首页
            HomeView()
                .tabItem {
                    Label("首页", systemImage: "house.fill")
                }
                .tag(0)
            
            // 认知模型
            CognitiveModelsView()
                .tabItem {
                    Label("认知模型", systemImage: "brain.fill")
                }
                .tag(1)
            
            // 思想片段
            ThoughtsView()
                .tabItem {
                    Label("思想片段", systemImage: "text.bubble.fill")
                }
                .tag(2)
            
            // AI任务
            AITasksView()
                .tabItem {
                    Label("AI任务", systemImage: "sparkles")
                }
                .tag(3)
            
            // 语音识别
            SpeechRecognitionViewWrapper()
                .tabItem {
                    Label("语音识别", systemImage: "mic.fill")
                }
                .tag(4)
            
            // 设置
            SettingsView()
                .tabItem {
                    Label("设置", systemImage: "gearshape.fill")
                }
                .tag(5)
        }
        .environmentObject(authViewModel)
        .onAppear {
            // 检查认证状态
            authViewModel.checkAuthStatus()
        }
    }
}

/// 首页视图
struct HomeView: View {
    var body: some View {
        VStack {
            Text("欢迎使用AI语音交互应用")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding()
            
            Text("这是应用的首页，您可以在这里访问各种功能")
                .font(.body)
                .foregroundColor(.gray)
                .padding()
            
            Spacer()
        }
        .navigationTitle("首页")
    }
}

/// 认知模型列表视图
struct CognitiveModelsView: View {
    /// 视图模型
    @StateObject private var viewModel = CognitiveModelListViewModel()
    /// 导航器
    @EnvironmentObject private var navigator: AppNavigator
    
    var body: some View {
        NavigationStack {
            VStack {
                // 搜索栏
                SearchBar(text: $viewModel.searchText)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                
                // 模型列表
                List {
                    ForEach(viewModel.models) { model in
                        CognitiveModelCard(model: model) {
                            // 导航到模型详情
                            navigator.navigateToCognitiveModelDetail(modelId: model.id)
                        } onDelete: {
                            Task {
                                await viewModel.deleteModel(model)
                            }
                        }
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                        .padding(.vertical, 8)
                    }
                    
                    // 加载更多
                    if viewModel.hasMoreData {
                        LoadMoreView(isLoading: viewModel.isLoadingMore) {
                            Task {
                                await viewModel.loadMoreModels()
                            }
                        }
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                    }
                    
                    // 空状态
                    if viewModel.models.isEmpty && !viewModel.isLoading {
                        EmptyStateView(
                            title: "暂无认知模型",
                            subtitle: "点击右上角按钮创建您的第一个认知模型",
                            action: {
                                navigator.navigate(to: .cognitiveModelCreate)
                            },
                            actionTitle: "创建模型"
                        )
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                        .frame(maxWidth: .infinity, minHeight: 300)
                    }
                }
                .listStyle(.plain)
                .refreshable {
                    await viewModel.refreshModels()
                }
                
                // 错误提示
                if let errorMessage = viewModel.errorMessage {
                    ErrorBanner(message: errorMessage) {
                        Task {
                            await viewModel.fetchModels()
                        }
                    }
                }
            }
            .navigationTitle("认知模型")
            .toolbar {
                // 添加模型按钮
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        navigator.navigate(to: .cognitiveModelCreate)
                    }) {
                        Image(systemName: "plus")
                            .font(.title2)
                    }
                }
            }
            .onAppear {
                Task {
                    await viewModel.fetchModels()
                }
            }
        }
    }
}

/// 搜索栏组件
struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .padding(.leading, 16)
            
            TextField("搜索认知模型...", text: $text)
                .padding(.vertical, 12)
                .padding(.trailing, 16)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                .autocapitalization(.none)
                .autocorrectionDisabled()
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                        .padding(.trailing, 16)
                }
            }
        }
        .background(Color(.systemBackground))
    }
}

/// 认知模型卡片组件
struct CognitiveModelCard: View {
    let model: CognitiveModel
    let onTap: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(model.name)
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text(model.description ?? "")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
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
                    // 概念数量
                    HStack(spacing: 4) {
                        Image(systemName: "circle.fill")
                            .foregroundColor(.blue)
                            .font(.caption)
                        Text("\(model.concepts?.count ?? 0) 概念")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // 关系数量
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.forward.circle.fill")
                            .foregroundColor(.green)
                            .font(.caption)
                        Text("\(model.relations?.count ?? 0) 关系")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // 更新时间
                    Text(model.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
        .onTapGesture {
            onTap()
        }
    }
}

/// 加载更多视图
struct LoadMoreView: View {
    let isLoading: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .padding(.trailing, 8)
                    Text("加载中...")
                } else {
                    Text("加载更多")
                }
            }
            .padding(.vertical, 16)
            .foregroundColor(.primary)
        }
        .disabled(isLoading)
    }
}

/// 空状态视图
struct EmptyStateView: View {
    let title: String
    let subtitle: String
    let action: () -> Void
    let actionTitle: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cube.transparent")
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(subtitle)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 48)
            
            Button(action: action) {
                Text(actionTitle)
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(8)
                    .font(.body)
                    .fontWeight(.bold)
            }
            .padding(.top, 16)
        }
    }
}

/// 错误提示横幅
struct ErrorBanner: View {
    let message: String
    let action: () -> Void
    
    var body: some View {
        HStack {
            Text(message)
                .font(.body)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
            
            Spacer()
            
            Button(action: action) {
                Text("重试")
                    .font(.body)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
            }
        }
        .background(Color.red)
        .frame(height: 44)
        .transition(.slide)
    }
}

/// 卡片组件
struct Card<Content: View>: View {
    let content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }
    
    var body: some View {
        content()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

/// 思想片段列表视图
struct ThoughtsView: View {
    var body: some View {
        Text("思想片段列表")
            .navigationTitle("思想片段")
    }
}



/// 设置视图
struct SettingsView: View {
    var body: some View {
        Text("设置")
            .navigationTitle("设置")
    }
}
