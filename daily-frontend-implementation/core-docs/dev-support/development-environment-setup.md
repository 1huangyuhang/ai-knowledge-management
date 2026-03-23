# 开发环境搭建

## 模块关联索引

### 所属环节
- **阶段**：第一阶段：基础架构搭建
- **周次**：第1周
- **天数**：第1天
- **开发主题**：项目初始化

### 对应文档
- [第1天：项目初始化](../../phase-1-foundation/week-1-setup/01-project-initialization-技术实现.md)

### 相关核心文档
- [技术栈选型](tech-stack-selection.md)
- [开发流程](development-process.md)

### 关联模块
- [技术栈选型](tech-stack-selection.md)
- [开发流程](development-process.md)

### 依赖关系
- [技术栈选型](tech-stack-selection.md)

## 1. 概述环境要求

### 1.1 硬件要求
- **Mac计算机**：运行macOS 13.0+（Ventura或更高版本）
- **内存**：至少8GB RAM，推荐16GB或更高
- **存储空间**：至少20GB可用空间

### 1.2 软件要求
- **Xcode**：15.0+（包含Swift 5.9+和SwiftUI 5.0+）
- **Command Line Tools for Xcode**：最新版本
- **Git**：2.30+（用于版本控制）
- **SwiftLint**：0.54.0+（用于代码质量检查）

## 2. 安装步骤

### 2.1 安装Xcode
1. 打开Mac App Store
2. 搜索"Xcode"
3. 点击"获取"按钮进行安装
4. 安装完成后，打开Xcode并同意许可协议
5. 等待Xcode完成初始设置

### 2.2 安装Command Line Tools for Xcode
1. 打开终端
2. 运行以下命令：
   ```bash
   xcode-select --install
   ```
3. 在弹出的窗口中点击"安装"按钮
4. 同意许可协议并等待安装完成

### 2.3 安装Git
1. 打开终端
2. 运行以下命令检查是否已安装Git：
   ```bash
   git --version
   ```
3. 如果未安装，终端会提示安装命令行开发者工具，按照提示进行安装
4. 或者使用Homebrew安装：
   ```bash
   brew install git
   ```

### 2.4 安装SwiftLint
1. 打开终端
2. 使用Homebrew安装SwiftLint：
   ```bash
   brew install swiftlint
   ```
3. 验证安装：
   ```bash
   swiftlint version
   ```

## 3. 项目设置

### 3.1 克隆代码库
1. 打开终端
2. 导航到要存放项目的目录
3. 运行以下命令克隆代码库：
   ```bash
   git clone <repository-url>
   cd daily-frontend-implementation
   ```

### 3.2 打开项目
1. 运行以下命令使用Xcode打开项目：
   ```bash
   open AI-Voice-Interaction-App.xcodeproj
   ```
   或
   ```bash
   open AI-Voice-Interaction-App.xcworkspace
   ```

### 3.3 配置依赖
1. Xcode会自动解析和下载Swift Package Manager依赖
2. 等待依赖解析完成
3. 如果遇到依赖问题，点击"File" > "Packages" > "Resolve Package Versions"

### 3.4 配置开发环境
1. 在Xcode中，选择"Product" > "Scheme" > "Edit Scheme"
2. 确保"Build Configuration"设置为"Debug"
3. 选择"Run" > "Options"，确保"Core Data"选项正确配置
4. 选择"Signing & Capabilities"，确保签名证书正确配置

## 4. 运行项目

### 4.1 选择模拟器或设备
1. 在Xcode工具栏中，选择要运行的模拟器或连接的物理设备
2. 推荐使用iPhone 15或iPhone 15 Pro模拟器进行开发

### 4.2 构建并运行
1. 点击Xcode工具栏中的"Run"按钮（▶️），或按下Command+R
2. Xcode会构建项目并在模拟器或设备上运行
3. 首次运行可能需要一些时间

### 4.3 验证安装
1. 应用启动后，检查是否能正常显示欢迎页面
2. 测试基本功能，如导航到不同页面
3. 检查控制台是否有错误信息

## 5. 配置SwiftLint

### 5.1 项目级配置
1. 检查项目根目录是否存在`.swiftlint.yml`文件
2. 如果不存在，创建该文件并添加以下内容：
   ```yaml
   included:
     - AI-Voice-Interaction-App
     - AI-Voice-Interaction-AppTests
   excluded:
     - Carthage
     - Pods
     - .build
   
   line_length: 120
   
   opt_in_rules:
     - empty_count
     - empty_string
     - explicit_init
     - fatal_error_message
     - first_where
     - force_unwrapping
     - implicit_return
     - joined_default_parameter
     - let_var_whitespace
     - literal_expression_end_indentation
     - modifier_order
     - multiline_arguments
     - multiline_literal_brackets
     - multiline_parameters
     - no_extension_access_modifier
     - operator_usage_whitespace
     - redundant_nil_coalescing
     - sorted_imports
     - toggle_bool
     - trailing_closure
     - unused_declaration
     - unused_import
   ```

### 5.2 Xcode集成
1. 打开项目设置
2. 选择"Build Phases"
3. 点击"+"按钮，选择"New Run Script Phase"
4. 将以下脚本添加到新创建的Run Script Phase：
   ```bash
   if which swiftlint >/dev/null; then
     swiftlint
   else
     echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
   fi
   ```
5. 拖动该Run Script Phase到"Compile Sources"之前

## 6. 常见问题及解决方案

### 6.1 Xcode启动项目失败
- **问题**：Xcode无法启动项目，提示"No such module"错误
- **解决方案**：清理项目缓存，点击"Product" > "Clean Build Folder"，然后重新构建项目

### 6.2 依赖解析失败
- **问题**：Swift Package Manager无法解析依赖
- **解决方案**：删除`.build`目录，然后点击"File" > "Packages" > "Resolve Package Versions"

### 6.3 模拟器运行缓慢
- **问题**：模拟器运行缓慢或卡顿
- **解决方案**：
  - 关闭不必要的应用程序
  - 增加Mac的虚拟内存
  - 使用物理设备进行测试

### 6.4 SwiftLint警告过多
- **问题**：SwiftLint产生过多警告
- **解决方案**：
  - 修复代码中的问题
  - 在`.swiftlint.yml`中调整规则
  - 对于无法修复的警告，使用`// swiftlint:disable <rule>`注释临时禁用

## 7. 开发工具推荐

### 7.1 IDE和编辑器
- **Xcode**：主要开发IDE
- **Visual Studio Code**：辅助编辑代码，安装Swift扩展

### 7.2 版本控制
- **GitHub Desktop**：图形化Git客户端
- **SourceTree**：免费的Git和Mercurial客户端

### 7.3 调试工具
- **Xcode Instruments**：用于性能分析和调试
- **Firebase Crashlytics**：用于崩溃报告和分析

### 7.4 设计工具
- **Figma**：用于UI设计和原型制作
- **Sketch**：用于UI设计

## 8. 后续步骤

1. 阅读[开发流程](development-process.md)文档，了解开发流程
2. 阅读[代码规范](code-style-guide.md)文档，了解代码规范
3. 阅读[API集成规范](../core-features/api-integration-spec.md)文档，了解API集成
4. 开始开发第一个功能
