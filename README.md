# AI 知识管理系统

## 项目简介

AI 知识管理系统是一个基于人工智能的认知辅助系统，旨在持续建模并分析用户的认知结构，输出结构反馈与思考方向。系统关注概念主干、层级、断裂与空洞，帮助用户更好地理解和管理自己的知识体系。

## 项目架构

系统采用 Clean Architecture 架构设计，分为以下层次：

- **Presentation**：用户界面层，负责与用户交互
- **Application**：应用服务层，处理业务逻辑
- **Domain**：领域模型层，核心业务逻辑
- **Infrastructure**：基础设施层，提供技术支持
- **AI Capability**：AI 能力层，封装 AI 相关功能

## 核心功能

1. **认知模型构建**：通过分析用户输入，构建和更新用户的认知模型
2. **概念关系分析**：识别和分析概念之间的关系，形成知识图谱
3. **认知洞察生成**：基于认知模型，生成结构化的反馈和思考方向
4. **知识碎片管理**：收集和组织用户的思考碎片，形成完整的知识体系

## 技术栈

- **后端**：Node.js LTS (≥18)、TypeScript、Express
- **前端**：React、TypeScript
- **数据库**：SQLite → Qdrant
- **AI**：LLM + Embedding
- **测试**：Jest

## 项目结构

```
├── __tests__/          # 测试文件
├── .trae/              # 项目配置
├── .vscode/            # VS Code 配置
├── backend/            # 后端代码
├── daily-backend-implementation/ # 后端每日实现
├── daily-frontend-implementation/ # 前端每日实现
├── initial-design/     # 初始设计文档
├── project-documentation/ # 项目文档
├── UNIFIED_CODE_GENERATION_GUIDE.md # 代码生成指南
└── unified-document-structure.md # 文档结构
```

## 核心领域模型

- **UserCognitiveModel**：用户认知模型
- **CognitiveConcept**：认知概念
- **CognitiveRelation**：认知关系
- **ThoughtFragment**：思考碎片
- **CognitiveInsight**：认知洞察

## 核心流程

1. **输入**：用户提供思考内容或问题
2. **解析**：LLM 分析输入内容，生成提案
3. **建模**：根据领域规则构建或更新认知模型
4. **反馈**：基于认知模型生成结构化反馈
5. **建议**：提供思考方向和改进建议

## 快速开始

### 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../daily-frontend-implementation
npm install
```

### 启动服务

```bash
# 启动后端服务
cd backend
npm start

# 启动前端开发服务器
cd ../daily-frontend-implementation
npm run dev
```

## 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行前端测试
cd ../daily-frontend-implementation
npm test
```

## 部署

系统支持容器化部署，可使用 Docker 进行构建和部署。

## 贡献

欢迎贡献代码、报告问题或提出建议。请确保遵循项目的代码规范和提交规范。

## 许可证

MIT License

## 联系我们

如有任何问题或建议，请通过 GitHub Issues 与我们联系。