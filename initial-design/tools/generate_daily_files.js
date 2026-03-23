const fs = require('fs');
const path = require('path');

// 创建输出目录
const outputDir = '/Users/huangyuhang/Downloads/Test/Ai知识管理/daily-backend-implementation';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 定义每天的内容模板
const createDailyContent = (day, content) => {
  return `# Day ${String(day).padStart(2, '0')}: ${content.title}

## 当日主题

${content.topic}

## 技术要点

${content.technicalPoints.map(point => `- ${point}`).join('\n')}

## 开发任务

${content.tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

## 验收标准

${content.acceptanceCriteria.map(criteria => `- ${criteria}`).join('\n')}

## 交付物

${content.deliverables.map(deliverable => `- ${deliverable}`).join('\n')}

## 相关资源

${content.resources.map(resource => `- ${resource}`).join('\n')}
`;
};

// 定义每天的内容
const dailyContent = [
  {
    title: '项目概述与架构设计',
    topic: '全面理解项目目标和架构设计，为后续开发打下基础。',
    technicalPoints: ['项目本质定义', '核心功能模块', '架构设计原则', '分层设计'],
    tasks: [
      '通读项目设计文档，理解系统目标和核心概念',
      '学习Clean Architecture基本思想',
      '分析系统的分层架构设计',
      '理解各功能模块的职责'
    ],
    acceptanceCriteria: [
      '能够清晰描述项目的核心目标和定位',
      '能够解释认知模型的概念和作用',
      '能够概述系统的主要功能模块',
      '能够理解系统的分层架构设计'
    ],
    deliverables: [
      '个人笔记：包含对项目的理解和疑问',
      '思维导图：项目核心概念和模块关系'
    ],
    resources: [
      '设计文档本身',
      'Clean Architecture相关资料',
      'Domain-Driven Design基础概念'
    ]
  },
  {
    title: '架构原则深入学习',
    topic: '深入学习Clean Architecture原则，为后续开发奠定理论基础。',
    technicalPoints: ['Domain First原则', 'AI作为依赖而非核心', '可替换设计', '单一职责原则', '高内聚低耦合', '依赖倒置'],
    tasks: [
      '深入学习Clean Architecture的六大原则',
      '理解Domain First设计理念',
      '分析AI在系统中的定位',
      '学习依赖倒置原则的实践应用'
    ],
    acceptanceCriteria: [
      '能够解释Clean Architecture的六大原则',
      '能够描述Domain First的设计理念',
      '能够说明AI在系统中的定位',
      '能够举例说明依赖倒置原则的应用'
    ],
    deliverables: [
      '学习笔记：Clean Architecture原则',
      '思维导图：架构原则关系'
    ],
    resources: [
      'Clean Architecture相关资料',
      '依赖倒置原则实践文章',
      'Domain-Driven Design基础概念'
    ]
  },
  {
    title: '核心Domain对象定义',
    topic: '定义系统核心的Domain对象，包括认知模型、概念、关系等核心实体。',
    technicalPoints: ['Domain对象设计', '实体与值对象的区别', '领域模型关系', 'TypeScript类型定义', '不可变性设计'],
    tasks: [
      '定义核心Domain对象：UserCognitiveModel、CognitiveConcept、CognitiveRelation、ThoughtFragment、CognitiveProposal、CognitiveInsight',
      '为每个Domain对象设计属性和方法',
      '编写TypeScript类型定义文件',
      '确保Domain对象设计符合DDD原则'
    ],
    acceptanceCriteria: [
      '所有核心Domain对象都已定义',
      '每个对象都有清晰的属性和方法',
      '对象设计符合DDD原则',
      'TypeScript类型定义完整',
      '对象间关系清晰'
    ],
    deliverables: [
      'Domain对象设计文档',
      'TypeScript接口定义文件',
      '对象关系图'
    ],
    resources: [
      '项目设计文档中的Domain层设计',
      'DDD实体设计最佳实践',
      'TypeScript接口和类型定义文档'
    ]
  },
  {
    title: '对象关系图设计',
    topic: '设计对象关系图，明确核心实体之间的关系。',
    technicalPoints: ['实体关系设计', '对象间依赖关系', '关系类型定义', '可视化工具使用'],
    tasks: [
      '分析核心实体之间的关系',
      '设计对象关系图',
      '定义关系类型枚举',
      '确保关系设计符合业务逻辑'
    ],
    acceptanceCriteria: [
      '对象关系图清晰展示所有核心实体',
      '实体之间的关系定义准确',
      '关系类型枚举完整',
      '关系设计符合业务逻辑'
    ],
    deliverables: [
      '对象关系图',
      '关系类型枚举定义',
      '关系设计说明文档'
    ],
    resources: [
      'UML类图设计资料',
      'DDD实体关系设计最佳实践',
      '可视化工具（如Draw.io）'
    ]
  },
  {
    title: '项目目录结构建立',
    topic: '建立符合Clean Architecture的项目目录结构，为后续开发做好准备。',
    technicalPoints: ['Clean Architecture目录结构', '模块划分原则', '项目配置文件', 'TypeScript项目初始化', '依赖管理'],
    tasks: [
      '建立项目基础目录结构',
      '初始化项目配置文件',
      '安装必要的依赖',
      '配置开发环境'
    ],
    acceptanceCriteria: [
      '项目目录结构符合Clean Architecture原则',
      '所有必要的配置文件已创建',
      '项目能正常编译',
      '代码质量工具能正常运行'
    ],
    deliverables: [
      '完整的项目目录结构',
      '初始化的配置文件',
      '安装的依赖列表',
      '可运行的开发环境'
    ],
    resources: [
      'Clean Architecture目录结构最佳实践',
      'TypeScript项目配置指南',
      'Fastify项目初始化文档'
    ]
  },
  {
    title: 'Domain层空代码实现',
    topic: '实现Domain层的基础代码框架，包括实体、值对象和领域服务。',
    technicalPoints: ['TypeScript类实现', '接口与抽象类', '不可变性实现', '领域服务设计', '值对象设计'],
    tasks: [
      '实现核心实体的TypeScript类',
      '实现值对象',
      '设计领域服务接口',
      '确保代码符合DDD原则'
    ],
    acceptanceCriteria: [
      '核心实体的TypeScript类已实现',
      '值对象已实现',
      '领域服务接口已设计',
      '代码符合DDD原则'
    ],
    deliverables: [
      'Domain层的TypeScript实现',
      '值对象实现',
      '领域服务接口定义'
    ],
    resources: [
      'TypeScript类设计最佳实践',
      'DDD领域服务设计指南',
      '不可变性实现技巧'
    ]
  },
  {
    title: 'Domain层代码优化与重构',
    topic: '优化和重构Domain层代码，确保符合设计原则。',
    technicalPoints: ['代码重构原则', '性能优化', '可读性提升', '测试性设计', '代码质量'],
    tasks: [
      '优化Domain层代码结构',
      '重构不合理的设计',
      '提升代码可读性',
      '确保代码便于测试'
    ],
    acceptanceCriteria: [
      '代码结构清晰合理',
      '设计符合DDD原则',
      '代码可读性高',
      '代码便于测试'
    ],
    deliverables: [
      '优化后的Domain层代码',
      '重构记录',
      '代码质量报告'
    ],
    resources: [
      '代码重构原则',
      'TypeScript代码优化技巧',
      'DDD最佳实践'
    ]
  },
  {
    title: 'Application层基础设计',
    topic: '设计Application层的基础结构，包括用例、接口定义和数据传输对象。',
    technicalPoints: ['Use Case设计', '接口定义原则', '数据传输对象设计', '工作流编排', '依赖倒置原则'],
    tasks: [
      '设计Use Case接口',
      '定义数据传输对象',
      '设计工作流编排框架',
      '确保符合依赖倒置原则'
    ],
    acceptanceCriteria: [
      'Use Case接口设计合理',
      '数据传输对象定义完整',
      '工作流编排框架设计清晰',
      '符合依赖倒置原则'
    ],
    deliverables: [
      'Use Case接口定义',
      '数据传输对象定义',
      '工作流编排框架设计'
    ],
    resources: [
      'Use Case设计最佳实践',
      '数据传输对象设计指南',
      '工作流编排模式'
    ]
  },
  {
    title: 'IngestThoughtUseCase实现',
    topic: '实现IngestThoughtUseCase，处理用户输入的思维片段。',
    technicalPoints: ['Use Case实现', '输入验证', '事件触发', '数据持久化', '错误处理'],
    tasks: [
      '实现IngestThoughtUseCase',
      '添加输入验证逻辑',
      '实现事件触发机制',
      '添加错误处理'
    ],
    acceptanceCriteria: [
      'IngestThoughtUseCase能正常工作',
      '输入验证逻辑有效',
      '能正确触发ThoughtIngested事件',
      '错误处理机制完善'
    ],
    deliverables: [
      'IngestThoughtUseCase实现',
      '输入验证逻辑',
      '事件触发机制'
    ],
    resources: [
      'Use Case实现最佳实践',
      '输入验证库文档',
      '事件驱动设计模式'
    ]
  },
  {
    title: 'GenerateProposalUseCase实现',
    topic: '实现GenerateProposalUseCase，生成认知建议。',
    technicalPoints: ['AI服务调用', 'Prompt设计', '结构化输出处理', '数据持久化', '异步处理'],
    tasks: [
      '设计AI服务接口',
      '实现GenerateProposalUseCase',
      '添加AI调用逻辑',
      '实现结构化输出处理'
    ],
    acceptanceCriteria: [
      'GenerateProposalUseCase能正常工作',
      'AI服务接口设计合理',
      '能正确调用AI服务',
      '能正确处理结构化输出'
    ],
    deliverables: [
      'AI服务接口定义',
      'GenerateProposalUseCase实现',
      'AI调用逻辑',
      '结构化输出处理'
    ],
    resources: [
      'AI服务调用最佳实践',
      'Prompt工程设计指南',
      '结构化输出处理技巧'
    ]
  }
];

// 生成90天的文件
for (let i = 0; i < 90; i++) {
  const day = i + 1;
  let content;
  
  // 根据天数确定阶段内容
  if (dailyContent[i]) {
    content = dailyContent[i];
  } else if (day <= 30) {
    // 第一阶段：系统地基期（第1-30天）
    if (day <= 7) {
      // Week 1：理解与建模（Day 1-7）
      content = {
        title: `第一阶段 - 系统地基期 - Week 1 - 第${day}天`,
        topic: `完成第一阶段第1周第${day}天的开发任务，重点是理解与建模。`,
        technicalPoints: ['Clean Architecture', 'Domain-Driven Design', '项目结构', '核心概念'],
        tasks: [`完成Day ${day}的核心任务`, `学习相关技术知识`, `编写文档`, `进行代码实现`],
        acceptanceCriteria: [`完成当日所有任务`, `代码符合设计规范`, `文档完整`, `能够解释当日所学内容`],
        deliverables: [`代码实现`, `学习笔记`, `文档`, `测试用例`],
        resources: [`设计文档`, `Clean Architecture资料`, `DDD基础概念`, `TypeScript文档`]
      };
    } else if (day <= 14) {
      // Week 2：Application层（Day 8-14）
      content = {
        title: `第一阶段 - 系统地基期 - Week 2 - 第${day}天`,
        topic: `完成第一阶段第2周第${day}天的开发任务，重点是Application层设计与实现。`,
        technicalPoints: ['Use Case设计', '接口定义', '数据传输对象', '工作流编排'],
        tasks: [`设计Use Case接口`, `定义数据传输对象`, `实现工作流框架`, `编写单元测试`],
        acceptanceCriteria: [`Use Case接口设计合理`, `数据传输对象定义完整`, `工作流框架能正常运行`, `单元测试通过`],
        deliverables: [`Use Case接口`, `数据传输对象`, `工作流框架`, `单元测试`],
        resources: [`Application层设计资料`, `Use Case设计最佳实践`, `数据传输对象设计指南`]
      };
    } else if (day <= 21) {
      // Week 3：Infrastructure层（Day 15-21）
      content = {
        title: `第一阶段 - 系统地基期 - Week 3 - 第${day}天`,
        topic: `完成第一阶段第3周第${day}天的开发任务，重点是Infrastructure层设计与实现。`,
        technicalPoints: ['SQLite存储', 'Repository实现', '事件系统', '日志系统', '错误处理'],
        tasks: [`实现数据库连接`, `实现Repository`, `设计事件系统`, `实现日志系统`, `添加错误处理`],
        acceptanceCriteria: [`数据库连接正常`, `Repository能正常工作`, `事件系统能正确触发事件`, `日志系统能记录日志`, `错误处理机制完善`],
        deliverables: [`数据库连接实现`, `Repository实现`, `事件系统实现`, `日志系统实现`, `错误处理机制`],
        resources: [`SQLite文档`, `Repository模式最佳实践`, `事件驱动设计模式`, `结构化日志设计`]
      };
    } else {
      // Week 4：最小系统跑通（Day 22-30）
      content = {
        title: `第一阶段 - 系统地基期 - Week 4 - 第${day}天`,
        topic: `完成第一阶段第4周第${day}天的开发任务，重点是最小系统跑通。`,
        technicalPoints: ['HTTP API', '输入处理', '认知建模', '模型输出', '系统整合'],
        tasks: [`实现HTTP API`, `处理用户输入`, `实现认知建模`, `生成模型摘要`, `进行系统整合测试`],
        acceptanceCriteria: [`HTTP API能正常响应`, `用户输入能正确处理`, `认知模型能正常更新`, `能生成模型摘要`, `系统能完整运行`],
        deliverables: [`HTTP API实现`, `输入处理模块`, `认知建模模块`, `模型输出模块`, `系统整合测试报告`],
        resources: [`Fastify文档`, `RESTful API设计指南`, `系统整合测试最佳实践`]
      };
    }
  } else if (day <= 60) {
    // 第二阶段：AI融合期（第31-60天）
    if (day <= 35) {
      // Day 31-35：接入LLM（解析Thought）
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是接入LLM解析思维片段。`,
        technicalPoints: ['LLM集成', 'Prompt设计', 'API调用', '结构化输出', '重试机制'],
        tasks: [`设计LLM客户端`, `实现API调用逻辑`, `设计Prompt模板`, `处理结构化输出`, `添加重试机制`],
        acceptanceCriteria: [`LLM客户端能正常工作`, `API调用能正确响应`, `Prompt能生成预期输出`, `能正确处理结构化输出`, `重试机制有效`],
        deliverables: [`LLM客户端实现`, `API调用逻辑`, `Prompt模板`, `结构化输出处理`, `重试机制实现`],
        resources: [`LLM API文档`, `Prompt工程设计指南`, `API调用最佳实践`]
      };
    } else if (day <= 40) {
      // Day 36-40：Embedding + 向量召回
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是Embedding和向量召回。`,
        technicalPoints: ['Embedding模型', '向量存储', '相似度搜索', 'Qdrant集成', '批量操作'],
        tasks: [`实现Embedding服务`, `集成Qdrant向量数据库`, `实现向量存储逻辑`, `实现相似度搜索`, `支持批量操作`],
        acceptanceCriteria: [`Embedding服务能生成向量`, `能正确存储向量到Qdrant`, `相似度搜索能返回相关结果`, `批量操作能正常工作`],
        deliverables: [`Embedding服务`, `Qdrant集成`, `向量存储逻辑`, `相似度搜索实现`, `批量操作支持`],
        resources: [`Embedding模型文档`, `Qdrant文档`, `向量数据库最佳实践`]
      };
    } else if (day <= 45) {
      // Day 41-45：认知关系推断
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是认知关系推断。`,
        technicalPoints: ['认知解析', '关系推断', '置信度评分', '结构验证', 'AI输出验证'],
        tasks: [`实现认知解析器`, `设计关系推断逻辑`, `添加置信度评分`, `实现结构验证`, `验证AI输出格式`],
        acceptanceCriteria: [`认知解析器能解析思维片段`, `关系推断能生成合理关系`, `置信度评分准确`, `结构验证能确保一致性`, `AI输出格式正确`],
        deliverables: [`认知解析器`, `关系推断逻辑`, `置信度评分机制`, `结构验证实现`, `AI输出验证逻辑`],
        resources: [`认知科学基础`, `关系推断算法`, `置信度评分方法`]
      };
    } else if (day <= 50) {
      // Day 46-50：认知模型演化
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是认知模型演化。`,
        technicalPoints: ['模型更新', '历史记录', '一致性维护', '版本管理', '演化分析'],
        tasks: [`实现模型更新逻辑`, `添加演化历史记录`, `维护模型一致性`, `实现版本管理`, `分析模型演化`],
        acceptanceCriteria: [`模型能正确更新`, `演化历史记录完整`, `模型保持一致性`, `版本管理有效`, `能分析模型演化`],
        deliverables: [`模型更新逻辑`, `演化历史记录`, `一致性维护机制`, `版本管理实现`, `演化分析工具`],
        resources: [`模型演化理论`, `版本管理最佳实践`, `一致性算法`]
      };
    } else if (day <= 55) {
      // Day 51-55：认知反馈生成
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是认知反馈生成。`,
        technicalPoints: ['洞察生成', '主题分析', '盲点检测', '空洞识别', '反馈格式化'],
        tasks: [`实现洞察生成逻辑`, `分析核心主题`, `检测思维盲点`, `识别概念空洞`, `格式化反馈输出`],
        acceptanceCriteria: [`能生成有价值的洞察`, `核心主题分析准确`, `思维盲点检测有效`, `概念空洞识别准确`, `反馈格式清晰`],
        deliverables: [`洞察生成逻辑`, `主题分析模块`, `盲点检测模块`, `空洞识别模块`, `反馈格式化实现`],
        resources: [`认知反馈理论`, `主题分析算法`, `盲点检测方法`]
      };
    } else {
      // Day 56-60：系统整合与复盘
      content = {
        title: `第二阶段 - AI融合期 - 第${day}天`,
        topic: `完成第二阶段第${day-30}天的开发任务，重点是系统整合与复盘。`,
        technicalPoints: ['系统整合', '测试', '性能优化', 'Bug修复', '复盘总结'],
        tasks: [`整合各模块功能`, `编写集成测试`, `优化系统性能`, `修复发现的Bug`, `进行阶段复盘`],
        acceptanceCriteria: [`系统能完整运行`, `集成测试通过`, `性能达到预期目标`, `Bug得到修复`, `完成阶段复盘报告`],
        deliverables: [`整合后的系统`, `集成测试用例`, `性能优化报告`, `Bug修复记录`, `阶段复盘报告`],
        resources: [`系统整合最佳实践`, `集成测试指南`, `性能优化技巧`]
      };
    }
  } else {
    // 第三阶段：认知辅助成型期（第61-90天）
    if (day <= 70) {
      // 思考建议生成等核心功能
      content = {
        title: `第三阶段 - 认知辅助成型期 - 第${day}天`,
        topic: `完成第三阶段第${day-60}天的开发任务，重点是思考建议生成。`,
        technicalPoints: ['建议生成', '个性化推荐', '排序算法', '依据说明', '用户反馈'],
        tasks: [`实现建议生成逻辑`, `添加个性化推荐`, `设计排序算法`, `生成建议依据`, `收集用户反馈`],
        acceptanceCriteria: [`能生成高质量建议`, `个性化推荐准确`, `排序结果合理`, `建议依据清晰`, `能收集用户反馈`],
        deliverables: [`建议生成逻辑`, `个性化推荐实现`, `排序算法`, `建议依据生成`, `用户反馈收集机制`],
        resources: [`推荐系统设计`, `排序算法`, `用户反馈机制`]
      };
    } else if (day <= 80) {
      // 系统优化与测试
      content = {
        title: `第三阶段 - 认知辅助成型期 - 第${day}天`,
        topic: `完成第三阶段第${day-60}天的开发任务，重点是系统优化与测试。`,
        technicalPoints: ['性能测试', '安全测试', '可靠性测试', '代码优化', '文档完善'],
        tasks: [`进行性能测试`, `开展安全测试`, `测试系统可靠性`, `优化代码质量`, `完善项目文档`],
        acceptanceCriteria: [`性能达到预期目标`, `安全测试通过`, `系统可靠稳定`, `代码质量提升`, `文档完整清晰`],
        deliverables: [`性能测试报告`, `安全测试报告`, `可靠性测试报告`, `优化后的代码`, `完善的文档`],
        resources: [`性能测试工具`, `安全测试指南`, `代码优化技巧`]
      };
    } else {
      // 部署与运维
      content = {
        title: `第三阶段 - 认知辅助成型期 - 第${day}天`,
        topic: `完成第三阶段第${day-60}天的开发任务，重点是部署与运维。`,
        technicalPoints: ['Docker部署', '环境配置', '监控告警', '日志管理', '备份恢复'],
        tasks: [`准备Docker镜像`, `配置部署环境`, `设置监控告警`, `实现日志管理`, `配置备份恢复`],
        acceptanceCriteria: [`Docker镜像能正常运行`, `部署环境配置正确`, `监控告警能正常工作`, `日志管理有效`, `备份恢复机制可靠`],
        deliverables: [`Docker镜像`, `部署环境配置`, `监控告警系统`, `日志管理实现`, `备份恢复机制`],
        resources: [`Docker文档`, `监控告警工具`, `日志管理最佳实践`]
      };
    }
  }
  
  const filePath = path.join(outputDir, `day-${String(day).padStart(2, '0')}.md`);
  const fileContent = createDailyContent(day, content);
  fs.writeFileSync(filePath, fileContent);
  console.log(`Generated: ${filePath}`);
}

console.log('Generation complete!');
