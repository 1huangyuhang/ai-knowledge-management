# 78-国际化技术实现文档

## 1. 架构设计

### 1.1 整体架构概述

国际化模块采用Clean Architecture设计，严格遵循分层原则，确保国际化系统的可维护性、可扩展性和可复用性。系统分为以下核心层次：

- **Presentation Layer**: 提供国际化相关的API接口和UI组件
- **Application Layer**: 协调国际化功能的执行和结果处理
- **Domain Layer**: 包含国际化的核心业务逻辑和模型
- **Infrastructure Layer**: 提供国际化工具集成和资源存储

### 1.2 模块关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    InternationalizationController           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                       i18nUIComponents                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Application Layer                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                InternationalizationService                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Domain Layer                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Locale  ────►  Translation  ────►  MessageBundle         │  │
│  │  └────────┐          └──────────┐            └──────┐   │  │
│  │           ▼                     ▼                    ▼   │  │
│  │  Formatting  ────►  Pluralization  ────►  RTL Support  │  │
│  └───────────────────────────────────────────────────────────────┘  │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │   i18next       │ │   Resource DB   │ │   Formatting    │        │
│  │  (i18n library) │ │  (SQLite/Postgres)│  (Intl API)      │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. 核心组件

### 2.1 国际化核心组件

| 组件名称 | 描述 | 核心接口 | 实现类 |
|---------|------|---------|--------|
| 国际化服务 | 管理国际化功能 | `InternationalizationService` | `InternationalizationServiceImpl` |
| 区域设置服务 | 管理区域设置 | `LocaleService` | `LocaleServiceImpl` |
| 翻译服务 | 管理翻译资源 | `TranslationService` | `TranslationServiceImpl` |
| 格式化服务 | 处理日期、时间、货币等格式化 | `FormattingService` | `FormattingServiceImpl` |
| 资源管理服务 | 管理国际化资源 | `ResourceManagementService` | `ResourceManagementServiceImpl` |
| 翻译生成服务 | 生成翻译内容 | `TranslationGenerationService` | `TranslationGenerationServiceImpl` |

### 2.2 策略模式应用

系统采用策略模式支持多种国际化实现和格式化方式：

- **翻译策略**: `FileBasedTranslationStrategy`, `DatabaseTranslationStrategy`, `RemoteTranslationStrategy`
- **格式化策略**: `IntlFormattingStrategy`, `CustomFormattingStrategy`
- **复数处理策略**: `RuleBasedPluralStrategy`, `CLDRPluralStrategy`
- **RTL支持策略**: `CSSRTLStrategy`, `NativeRTLStrategy`

## 3. 数据模型

### 3.1 核心领域模型

```typescript
// 区域设置模型
export interface Locale {
  id: string;
  code: string; // 如 en-US, zh-CN
  language: string; // 如 en, zh
  region: string; // 如 US, CN
  name: string; // 如 English (United States)
  nativeName: string; // 如 English (United States), 中文(简体)
  direction: TextDirection; // LTR or RTL
  active: boolean;
  default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 翻译模型
export interface Translation {
  id: string;
  localeId: string;
  key: string;
  value: string;
  context?: string;
  notes?: string;
  updatedAt: Date;
  updatedBy: string;
  status: TranslationStatus;
}

// 消息包模型
export interface MessageBundle {
  locale: string;
  messages: Record<string, string>;
  createdAt: Date;
  version: string;
}

// 格式化配置模型
export interface FormattingConfig {
  locale: string;
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
  currencyCode: string;
  currencyFormat: string;
  numberFormat: NumberFormatConfig;
}

// 翻译请求模型
export interface TranslationRequest {
  text: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
}
```

### 3.2 数据库 schema

```sql
-- 区域设置表
CREATE TABLE locales (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL,
  region TEXT NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LTR', 'RTL')),
  active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- 翻译表
CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  locale_id TEXT NOT NULL,
  translation_key TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  notes TEXT,
  updated_at DATETIME NOT NULL,
  updated_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'TRANSLATED', 'REVIEWED', 'OUTDATED')),
  FOREIGN KEY (locale_id) REFERENCES locales(id),
  UNIQUE(locale_id, translation_key, context)
);

-- 消息包表
CREATE TABLE message_bundles (
  id TEXT PRIMARY KEY,
  locale TEXT NOT NULL,
  messages_json TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  version TEXT NOT NULL,
  UNIQUE(locale, version)
);

-- 格式化配置表
CREATE TABLE formatting_configs (
  id TEXT PRIMARY KEY,
  locale TEXT NOT NULL UNIQUE,
  date_format TEXT NOT NULL,
  time_format TEXT NOT NULL,
  datetime_format TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_format TEXT NOT NULL,
  number_format_json TEXT NOT NULL,
  FOREIGN KEY (locale) REFERENCES locales(code)
);
```

## 4. API设计

### 4.1 核心API端点

| API路径 | 方法 | 描述 | 请求体 | 响应体 |
|---------|------|------|--------|--------|
| `/api/i18n/locales` | GET | 获取支持的区域设置列表 | 无 | `Locale[]` |
| `/api/i18n/locales` | POST | 创建新区域设置 | `CreateLocaleDto` | `Locale` |
| `/api/i18n/locales/:id` | GET | 获取区域设置详情 | 无 | `Locale` |
| `/api/i18n/locales/:id` | PUT | 更新区域设置 | `UpdateLocaleDto` | `Locale` |
| `/api/i18n/locales/:id` | DELETE | 删除区域设置 | 无 | `{ success: boolean }` |
| `/api/i18n/locales/:id/activate` | POST | 激活区域设置 | 无 | `Locale` |
| `/api/i18n/locales/:id/set-default` | POST | 设置默认区域设置 | 无 | `Locale` |
| `/api/i18n/translations` | GET | 获取翻译列表 | 无 | `Translation[]` |
| `/api/i18n/translations` | POST | 创建新翻译 | `CreateTranslationDto` | `Translation` |
| `/api/i18n/translations/:id` | GET | 获取翻译详情 | 无 | `Translation` |
| `/api/i18n/translations/:id` | PUT | 更新翻译 | `UpdateTranslationDto` | `Translation` |
| `/api/i18n/translations/:id` | DELETE | 删除翻译 | 无 | `{ success: boolean }` |
| `/api/i18n/translations/bundle` | GET | 获取消息包 | `{ locale: string }` | `MessageBundle` |
| `/api/i18n/translate` | POST | 翻译文本 | `TranslationRequest` | `{ translatedText: string }` |
| `/api/i18n/format/date` | GET | 格式化日期 | `{ date: string, locale: string, format?: string }` | `{ formattedDate: string }` |
| `/api/i18n/format/currency` | GET | 格式化货币 | `{ amount: number, currency: string, locale: string }` | `{ formattedCurrency: string }` |
| `/api/i18n/config` | GET | 获取格式化配置 | `{ locale: string }` | `FormattingConfig` |
| `/api/i18n/config` | PUT | 更新格式化配置 | `FormattingConfigDto` | `FormattingConfig` |

### 4.2 请求/响应示例

**获取消息包请求**:
```json
GET /api/i18n/translations/bundle?locale=zh-CN
```

**获取消息包响应**:
```json
{
  "locale": "zh-CN",
  "messages": {
    "welcome": "欢迎使用我们的系统",
    "login": "登录",
    "logout": "退出",
    "username": "用户名",
    "password": "密码"
  },
  "createdAt": "2024-01-08T12:00:00Z",
  "version": "1.0.0"
}
```

**翻译文本请求**:
```json
POST /api/i18n/translate
Content-Type: application/json

{
  "text": "Hello, world!",
  "sourceLocale": "en-US",
  "targetLocale": "zh-CN"
}
```

**翻译文本响应**:
```json
{
  "translatedText": "你好，世界！"
}
```

## 5. 核心业务流程

### 5.1 翻译请求流程

```
1. 客户端请求翻译文本
2. 国际化服务接收请求
3. 检查缓存中是否存在翻译
4. 如果缓存中没有，查询数据库
5. 如果数据库中没有，调用外部翻译服务（可选）
6. 返回翻译结果
7. 更新缓存
```

### 5.2 区域设置切换流程

```
1. 客户端请求切换区域设置
2. 国际化服务接收请求
3. 验证区域设置是否可用
4. 更新用户的区域设置偏好
5. 返回新的区域设置
6. 客户端更新UI和缓存
```

### 5.3 翻译管理流程

```
1. 管理员添加新翻译键
2. 国际化服务创建翻译记录
3. 翻译服务自动生成初始翻译（可选）
4. 管理员审核和修改翻译
5. 翻译状态更新为已审核
6. 新的消息包生成并发布
```

## 6. 技术实现

### 6.1 国际化库集成

| 库 | 用途 | 集成方式 |
|------|------|---------|
| i18next | 国际化核心库 | Node.js API集成 |
| react-i18next | React国际化集成 | React组件集成 |
| i18next-http-backend | HTTP后端支持 | 插件集成 |
| i18next-fs-backend | 文件系统后端支持 | 插件集成 |
| i18next-browser-languagedetector | 浏览器语言检测 | 插件集成 |
| Intl API | 格式化和本地化 | 原生API使用 |

### 6.2 核心功能实现

| 功能 | 实现方式 | 技术细节 |
|------|---------|---------|
| 多语言支持 | i18next | 支持JSON/YAML格式的翻译文件 |
| 区域设置检测 | i18next-browser-languagedetector | 支持从URL、cookie、localStorage等检测 |
| 日期时间格式化 | Intl.DateTimeFormat | 支持不同区域的日期时间格式 |
| 货币格式化 | Intl.NumberFormat | 支持不同货币的格式化 |
| 复数形式处理 | i18next复数规则 | 支持多种语言的复数形式 |
| 右到左语言支持 | CSS和i18next | 自动添加RTL类和配置 |
| 翻译管理 | 自定义API | 支持翻译的添加、编辑、审核 |
| 翻译生成 | 外部API集成 | 支持集成Google Translate、DeepL等 |

### 6.3 支持的语言和区域

| 语言 | 区域 | 代码 | 方向 |
|------|------|------|------|
| 英语 | 美国 | en-US | LTR |
| 英语 | 英国 | en-GB | LTR |
| 中文 | 简体 | zh-CN | LTR |
| 中文 | 繁体 | zh-TW | LTR |
| 日语 | 日本 | ja-JP | LTR |
| 韩语 | 韩国 | ko-KR | LTR |
| 法语 | 法国 | fr-FR | LTR |
| 德语 | 德国 | de-DE | LTR |
| 西班牙语 | 西班牙 | es-ES | LTR |
| 阿拉伯语 | 沙特阿拉伯 | ar-SA | RTL |
| 希伯来语 | 以色列 | he-IL | RTL |

## 7. 国际化最佳实践

### 7.1 开发最佳实践

- **使用语义化的翻译键**: 避免使用硬编码的翻译值
- **保持翻译键的一致性**: 使用命名空间和清晰的命名规则
- **提供上下文和注释**: 帮助翻译人员理解翻译的上下文
- **避免复杂的翻译逻辑**: 保持翻译值的简洁性
- **测试所有语言**: 确保所有语言版本都能正常工作
- **考虑文本长度变化**: 设计UI时考虑不同语言文本长度的差异
- **支持动态内容**: 确保动态生成的内容也能正确翻译

### 7.2 翻译管理最佳实践

- **建立翻译工作流程**: 包括添加、翻译、审核、发布等步骤
- **使用专业的翻译工具**: 考虑使用翻译管理系统(TMS)
- **定期更新翻译**: 确保翻译与最新的功能保持同步
- **支持翻译版本控制**: 跟踪翻译的变更历史
- **提供翻译统计**: 了解翻译进度和覆盖率

## 8. 部署和集成

### 8.1 部署架构

- **开发环境**: 本地文件系统存储翻译资源
- **测试环境**: 数据库存储翻译资源，支持实时更新
- **生产环境**: 数据库存储翻译资源，配合CDN缓存消息包

### 8.2 CI/CD集成

- **自动化翻译生成**: 在CI流程中自动生成初始翻译
- **翻译质量检查**: 在CI流程中检查翻译的完整性和质量
- **自动构建消息包**: 当翻译更新时自动构建和发布消息包
- **部署前验证**: 确保所有必需的翻译都已完成

## 9. 监控和分析

### 9.1 监控指标

- 翻译覆盖率: 已翻译的键占总键数的百分比
- 翻译状态分布: 不同状态的翻译数量
- 语言使用情况: 各语言的使用频率
- 翻译请求延迟: 翻译请求的响应时间
- 缓存命中率: 翻译缓存的命中率

### 9.2 分析功能

- 翻译使用分析: 了解哪些翻译被频繁使用
- 翻译更新频率: 跟踪翻译的更新情况
- 翻译质量反馈: 收集用户对翻译质量的反馈
- 语言偏好趋势: 分析用户语言偏好的变化

## 10. 代码组织

```
src/
├── presentation/
│   ├── controllers/
│   │   └── InternationalizationController.ts
│   ├── components/
│   │   ├── LanguageSwitcher.tsx
│   │   └── TranslatedText.tsx
│   ├── middlewares/
│   │   └── LanguageMiddleware.ts
│   └── routes/
│       └── i18nRoutes.ts
├── application/
│   ├── services/
│   │   ├── InternationalizationService.ts
│   │   ├── LocaleService.ts
│   │   ├── TranslationService.ts
│   │   └── FormattingService.ts
│   └── dto/
├── domain/
│   ├── models/
│   │   ├── Locale.ts
│   │   ├── Translation.ts
│   │   ├── MessageBundle.ts
│   │   └── FormattingConfig.ts
│   ├── services/
│   │   └── ResourceManagementService.ts
│   └── strategies/
│       ├── translation/
│       ├── formatting/
│       ├── pluralization/
│       └── rtl-support/
├── infrastructure/
│   ├── i18n/
│   │   ├── i18nextConfig.ts
│   │   └── translationLoader.ts
│   ├── storage/
│   │   ├── DatabaseTranslationStorage.ts
│   │   └── FileTranslationStorage.ts
│   └── translation-providers/
│       └── ExternalTranslationProvider.ts
├── shared/
│   ├── i18n/
│   │   └── locales.ts
│   ├── utils/
│   └── constants/
└── public/
    └── locales/
        ├── en-US.json
        ├── zh-CN.json
        └── ...
```

## 11. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >=18 | 运行环境 |
| TypeScript | 5.x | 开发语言 |
| Express | 4.x | Web框架 |
| React | 18.x | UI框架 |
| i18next | 23.x | 国际化核心库 |
| react-i18next | 13.x | React国际化集成 |
| Intl API | 浏览器原生 | 格式化和本地化 |
| SQLite | 3.x | 测试数据存储 |
| PostgreSQL | 14.x | 生产数据存储 |
| Jest | 29.x | 测试框架 |
| Docker | 20.x | 容器化 |

## 12. 未来发展方向

1. **AI辅助翻译**: 利用AI自动生成和优化翻译
2. **实时翻译**: 支持实时翻译新添加的内容
3. **翻译记忆**: 利用翻译记忆提高翻译效率和一致性
4. **多语言搜索**: 支持在所有语言中搜索内容
5. **本地化内容管理**: 支持不同区域的内容变体
6. **自动化翻译质量评估**: 自动评估翻译质量
7. **支持更多语言**: 扩展支持的语言和区域
8. **与设计系统集成**: 在设计阶段考虑国际化
9. **支持右到左语言的更好集成**: 改进RTL语言的支持
10. **国际化测试自动化**: 自动化测试多语言版本

## 13. 总结

国际化模块是系统优化的重要组成部分，通过系统化的国际化设计和实现，可以确保系统能够支持全球用户，提供良好的本地化体验。本实现采用Clean Architecture设计，严格遵循分层原则，具有良好的可维护性、可扩展性和可复用性。

系统支持多种语言和区域，集成了成熟的国际化库和工具，能够处理日期、时间、货币等格式化，支持复数形式和右到左语言。通过与CI/CD流程的集成，可以实现翻译的自动化管理和发布。

未来将继续增强AI辅助翻译能力，实现实时翻译和翻译记忆，提高翻译效率和质量，为全球用户提供更好的本地化体验。