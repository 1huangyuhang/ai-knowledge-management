# AI-Voice-Interaction-App 项目重构计划

## 1. 重构目标
- 保持Clean Architecture分层结构
- 优化文件组织，使其更符合功能模块
- 确保各层之间的依赖关系正确
- 提高代码的可读性和可维护性
- 确保重构后项目能正常编译和运行

## 2. 重构原则
- **Domain层**：不依赖任何其他层
- **Service层**：依赖Domain层，不依赖Presentation层
- **Presentation层**：依赖Domain和Service层
- **ViewModel层**：连接Presentation和Domain层

## 3. 具体重构内容

### 3.1 优化Core目录结构
- 将Core目录下的文件按功能分类
- 创建Core/Extensions目录，存放扩展文件
- 创建Core/Utils目录，存放工具类

### 3.2 优化Service目录结构
- 将Service/API目录下的文件保持不变
- 将Service/Repositories目录下的文件按功能模块分组
- 创建Service/AI目录，存放AI相关服务
- 创建Service/Speech目录，存放语音服务（已存在，保持不变）

### 3.3 优化Domain目录结构
- 将Domain/Models目录下的文件按实体类型分组
- 将Domain/Protocols目录下的文件按功能模块分组

### 3.4 优化Presentation目录结构
- 将Presentation/Components目录下的文件保持不变
- 将Presentation/Navigation目录下的文件保持不变
- 将Presentation/Screens目录下的文件按功能模块分组

### 3.5 优化ViewModel目录结构
- 将ViewModel目录下的文件按功能模块分组，与Presentation/Screens对应

### 3.6 优化Assets目录结构
- 将Assets/Colors目录下的文件保持不变
- 创建Assets/Images目录，存放图片资源（如果有）

### 3.7 其他优化
- 移除冗余的ContentView.swift，使用MainTabView作为主视图
- 确保所有文件命名一致，遵循驼峰命名法
- 优化导入顺序，确保按标准顺序排列
- 统一注释格式，提高代码可读性

## 4. 重构后的目录结构
```
AI-Voice-Interaction-App/
├── AI_Voice_Interaction_AppApp.swift       # 应用入口
├── Assets/                                 # 资源文件
│   ├── Colors/                             # 颜色定义
│   └── Images/                             # 图片资源
├── Core/                                   # 核心服务
│   ├── Extensions/                         # 扩展文件
│   ├── Services/                           # 核心服务
│   └── Utils/                              # 工具类
├── Domain/                                 # 领域层
│   ├── Models/                             # 领域模型
│   │   ├── AI/                             # AI相关模型
│   │   ├── Auth/                           # 认证相关模型
│   │   └── Cognitive/                      # 认知相关模型
│   └── Protocols/                          # 领域协议
│       ├── AI/                             # AI相关协议
│       ├── Auth/                           # 认证相关协议
│       └── Cognitive/                      # 认知相关协议
├── Presentation/                           # 表示层
│   ├── Components/                         # UI组件
│   ├── Navigation/                         # 导航
│   └── Screens/                            # 屏幕
│       ├── AIConversation/                 # AI对话相关屏幕
│       ├── Auth/                           # 认证相关屏幕
│       └── CognitiveModels/                # 认知模型相关屏幕
├── Service/                                # 服务层
│   ├── API/                                # API客户端
│   ├── AI/                                 # AI相关服务
│   ├── Repositories/                       # 仓库实现
│   │   ├── AI/                             # AI相关仓库
│   │   ├── Auth/                           # 认证相关仓库
│   │   └── Cognitive/                      # 认知相关仓库
│   └── Speech/                             # 语音服务
└── ViewModel/                              # 视图模型
    ├── AIConversation/                     # AI对话相关视图模型
    ├── Auth/                               # 认证相关视图模型
    └── CognitiveModels/                    # 认知模型相关视图模型
```

## 5. 重构步骤
1. 创建新的目录结构
2. 按功能模块移动和重命名文件
3. 修复导入路径
4. 优化代码结构和命名
5. 确保项目能正常编译和运行

## 6. 预期效果
- 项目结构更清晰，文件按功能模块组织
- 各层之间的依赖关系更明确
- 代码可读性和可维护性提高
- 便于后续功能扩展
- 项目能正常编译和运行

## 7. 注意事项
- 重构过程中要确保项目能正常编译
- 不要修改核心业务逻辑
- 保持各层之间的依赖关系正确
- 遵循Swift编码规范
- 确保所有测试通过（如果有）