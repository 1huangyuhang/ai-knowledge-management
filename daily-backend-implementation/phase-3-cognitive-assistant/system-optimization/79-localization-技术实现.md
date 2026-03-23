# 79-本地化技术实现文档

## 1. 架构设计

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│ Presentation Layer (API层)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ LocalizationController (本地化API控制器)                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Application Layer (应用层)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ LocalizationService (本地化服务)                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Domain Layer (领域层)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Localization (本地化领域模型)                                │ │
│ │ ├── Locale (区域设置)                                       │ │
│ │ ├── Translation (翻译)                                       │ │
│ │ ├── FormattingRule (格式化规则)                              │ │
│ │ └── LocalizationPolicy (本地化策略)                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure Layer (基础设施层)                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ LocalizationRepository (本地化仓库)                          │ │
│ │ ├── FileLocalizationRepository (文件存储实现)                │ │
│ │ └── DatabaseLocalizationRepository (数据库存储实现)          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心依赖关系

- **i18next**: 国际化和本地化框架
- **i18next-fs-backend**: 文件系统后端
- **i18next-http-middleware**: HTTP中间件支持
- **dayjs**: 日期时间格式化
- **intl-messageformat**: 消息格式化

## 2. 核心组件

### 2.1 LocalizationService

```typescript
// src/application/localization/LocalizationService.ts
export interface LocalizationService {
  /**
   * 获取指定区域的翻译
   * @param locale 区域代码
   * @param key 翻译键
   * @param options 翻译选项
   * @returns 翻译后的文本
   */
  translate(locale: string, key: string, options?: Record<string, any>): Promise<string>;

  /**
   * 批量获取翻译
   * @param locale 区域代码
   * @param keys 翻译键数组
   * @returns 翻译后的文本映射
   */
  batchTranslate(locale: string, keys: string[]): Promise<Record<string, string>>;

  /**
   * 格式化日期时间
   * @param locale 区域代码
   * @param date 日期时间
   * @param format 格式化选项
   * @returns 格式化后的日期时间字符串
   */
  formatDate(locale: string, date: Date | string | number, format?: string): Promise<string>;

  /**
   * 格式化数字
   * @param locale 区域代码
   * @param number 数字
   * @param format 格式化选项
   * @returns 格式化后的数字字符串
   */
  formatNumber(locale: string, number: number, format?: string): Promise<string>;

  /**
   * 格式化货币
   * @param locale 区域代码
   * @param amount 金额
   * @param currency 货币代码
   * @returns 格式化后的货币字符串
   */
  formatCurrency(locale: string, amount: number, currency: string): Promise<string>;

  /**
   * 获取支持的区域列表
   * @returns 支持的区域代码列表
   */
  getSupportedLocales(): Promise<string[]>;

  /**
   * 更新翻译
   * @param locale 区域代码
   * @param key 翻译键
   * @param value 翻译值
   * @returns 更新结果
   */
  updateTranslation(locale: string, key: string, value: string): Promise<boolean>;
}
```

### 2.2 LocalizationRepository

```typescript
// src/infrastructure/localization/LocalizationRepository.ts
export interface LocalizationRepository {
  /**
   * 获取指定区域的翻译数据
   * @param locale 区域代码
   * @returns 翻译数据映射
   */
  getTranslations(locale: string): Promise<Record<string, string>>;

  /**
   * 保存翻译数据
   * @param locale 区域代码
   * @param translations 翻译数据映射
   * @returns 保存结果
   */
  saveTranslations(locale: string, translations: Record<string, string>): Promise<boolean>;

  /**
   * 获取支持的区域列表
   * @returns 支持的区域代码列表
   */
  getSupportedLocales(): Promise<string[]>;

  /**
   * 添加新区域
   * @param locale 区域代码
   * @returns 添加结果
   */
  addLocale(locale: string): Promise<boolean>;

  /**
   * 删除区域
   * @param locale 区域代码
   * @returns 删除结果
   */
  removeLocale(locale: string): Promise<boolean>;
}
```

## 3. 数据模型

### 3.1 Locale (区域设置)

```typescript
// src/domain/localization/Locale.ts
export interface Locale {
  /** 区域代码 (如: zh-CN, en-US) */
  code: string;
  /** 区域名称 (如: 简体中文, English - US) */
  name: string;
  /** 是否为默认区域 */
  isDefault: boolean;
  /** 是否启用 */
  isEnabled: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

### 3.2 Translation (翻译)

```typescript
// src/domain/localization/Translation.ts
export interface Translation {
  /** 翻译ID */
  id: string;
  /** 区域代码 */
  localeCode: string;
  /** 翻译键 */
  key: string;
  /** 翻译值 */
  value: string;
  /** 注释 */
  comment?: string;
  /** 是否需要更新 */
  needsUpdate: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
```

### 3.3 FormattingRule (格式化规则)

```typescript
// src/domain/localization/FormattingRule.ts
export interface FormattingRule {
  /** 规则ID */
  id: string;
  /** 区域代码 */
  localeCode: string;
  /** 规则类型 (date, number, currency) */
  type: 'date' | 'number' | 'currency';
  /** 规则名称 */
  name: string;
  /** 规则配置 */
  config: Record<string, any>;
  /** 是否为默认规则 */
  isDefault: boolean;
}
```

## 4. API设计

### 4.1 翻译API

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/localization/translate | 获取翻译 | locale, key, options | { translated: string } |
| POST | /api/localization/translate/batch | 批量获取翻译 | { locale: string, keys: string[] } | { translations: Record<string, string> } |
| POST | /api/localization/translate/update | 更新翻译 | { locale: string, key: string, value: string } | { success: boolean } |

### 4.2 格式化API

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/localization/format/date | 格式化日期 | locale, date, format | { formatted: string } |
| GET | /api/localization/format/number | 格式化数字 | locale, number, format | { formatted: string } |
| GET | /api/localization/format/currency | 格式化货币 | locale, amount, currency | { formatted: string } |

### 4.3 区域管理API

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/localization/locales | 获取所有区域 | - | { locales: Locale[] } |
| POST | /api/localization/locales | 添加区域 | { code: string, name: string } | { success: boolean, locale: Locale } |
| PUT | /api/localization/locales/:code | 更新区域 | { name: string, isDefault?: boolean, isEnabled?: boolean } | { success: boolean, locale: Locale } |
| DELETE | /api/localization/locales/:code | 删除区域 | - | { success: boolean } |

## 5. 核心业务流程

### 5.1 翻译请求流程

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 客户端请求翻译       │    │ LocalizationService │    │ LocalizationRepository │
└───────────┬─────────┘    └───────────┬─────────┘    └───────────┬─────────┘
            │                          │                          │
            │ 1. 调用translate方法     │                          │
            ├──────────────────────────►                          │
            │                          │ 2. 调用getTranslations   │
            │                          ├──────────────────────────►
            │                          │                          │
            │                          │ 3. 返回翻译数据           │
            │                          ◄──────────────────────────┘
            │                          │                          │
            │                          │ 4. 执行翻译格式化         │
            │                          │                          │
            │ 5. 返回翻译结果           │                          │
            ◄──────────────────────────┘                          │
┌───────────┴─────────┐                                           │
│ 客户端接收翻译结果   │                                           │
└─────────────────────┘                                           │
```

### 5.2 翻译更新流程

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 管理后台更新翻译     │    │ LocalizationService │    │ LocalizationRepository │
└───────────┬─────────┘    └───────────┬─────────┘    └───────────┬─────────┘
            │                          │                          │
            │ 1. 调用updateTranslation  │                          │
            ├──────────────────────────►                          │
            │                          │ 2. 调用saveTranslations  │
            │                          ├──────────────────────────►
            │                          │                          │
            │                          │ 3. 保存翻译数据           │
            │                          ◄──────────────────────────┘
            │                          │                          │
            │ 4. 返回更新结果           │                          │
            ◄──────────────────────────┘                          │
┌───────────┴─────────┐                                           │
│ 管理后台接收结果     │                                           │
└─────────────────────┘                                           │
```

## 6. 技术实现

### 6.1 本地化服务实现

```typescript
// src/application/localization/LocalizationServiceImpl.ts
import { LocalizationService } from './LocalizationService';
import { LocalizationRepository } from '../../infrastructure/localization/LocalizationRepository';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

// 注册dayjs插件
dayjs.extend(localizedFormat);

export class LocalizationServiceImpl implements LocalizationService {
  constructor(private localizationRepository: LocalizationRepository) {}

  async translate(locale: string, key: string, options?: Record<string, any>): Promise<string> {
    // 获取翻译数据
    const translations = await this.localizationRepository.getTranslations(locale);
    let translation = translations[key] || key;

    // 替换占位符
    if (options) {
      for (const [placeholder, value] of Object.entries(options)) {
        translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
      }
    }

    return translation;
  }

  async batchTranslate(locale: string, keys: string[]): Promise<Record<string, string>> {
    const translations = await this.localizationRepository.getTranslations(locale);
    const result: Record<string, string> = {};

    for (const key of keys) {
      result[key] = translations[key] || key;
    }

    return result;
  }

  async formatDate(locale: string, date: Date | string | number, format?: string): Promise<string> {
    dayjs.locale(locale);
    return dayjs(date).format(format || 'LLL');
  }

  async formatNumber(locale: string, number: number, format?: string): Promise<string> {
    return new Intl.NumberFormat(locale, format ? JSON.parse(format) : undefined).format(number);
  }

  async formatCurrency(locale: string, amount: number, currency: string): Promise<string> {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  async getSupportedLocales(): Promise<string[]> {
    return this.localizationRepository.getSupportedLocales();
  }

  async updateTranslation(locale: string, key: string, value: string): Promise<boolean> {
    const translations = await this.localizationRepository.getTranslations(locale);
    translations[key] = value;
    return this.localizationRepository.saveTranslations(locale, translations);
  }
}
```

### 6.2 本地化仓库实现 (文件系统)

```typescript
// src/infrastructure/localization/FileLocalizationRepository.ts
import { LocalizationRepository } from './LocalizationRepository';
import * as fs from 'fs';
import * as path from 'path';

// 翻译文件目录
const TRANSLATIONS_DIR = path.join(process.cwd(), 'public', 'locales');

export class FileLocalizationRepository implements LocalizationRepository {
  async getTranslations(locale: string): Promise<Record<string, string>> {
    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  async saveTranslations(locale: string, translations: Record<string, string>): Promise<boolean> {
    try {
      // 确保目录存在
      if (!fs.existsSync(TRANSLATIONS_DIR)) {
        fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
      }

      const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save translations:', error);
      return false;
    }
  }

  async getSupportedLocales(): Promise<string[]> {
    if (!fs.existsSync(TRANSLATIONS_DIR)) {
      return [];
    }

    const files = fs.readdirSync(TRANSLATIONS_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  async addLocale(locale: string): Promise<boolean> {
    const translations: Record<string, string> = {};
    return this.saveTranslations(locale, translations);
  }

  async removeLocale(locale: string): Promise<boolean> {
    try {
      const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove locale:', error);
      return false;
    }
  }
}
```

## 7. 测试策略

### 7.1 单元测试

| 模块 | 测试重点 | 测试框架 |
|------|----------|----------|
| LocalizationService | 翻译逻辑、格式化逻辑 | Jest |
| LocalizationRepository | 数据存取逻辑 | Jest + Mock |
| FormattingUtils | 日期、数字、货币格式化 | Jest |

### 7.2 集成测试

| 测试场景 | 测试重点 | 测试框架 |
|----------|----------|----------|
| API集成测试 | 翻译API的完整流程 | Supertest + Jest |
| 翻译更新集成测试 | 翻译更新的完整流程 | Supertest + Jest |
| 多区域支持测试 | 不同区域的翻译支持 | Jest |

### 7.3 端到端测试

| 测试场景 | 测试重点 | 测试框架 |
|----------|----------|----------|
| 本地化功能完整流程 | 从客户端请求到翻译返回 | Cypress |
| 管理后台本地化管理 | 翻译的增删改查功能 | Cypress |

## 8. 部署与集成

### 8.1 部署配置

```typescript
// src/infrastructure/config/localizationConfig.ts
export const localizationConfig = {
  /** 默认区域 */
  defaultLocale: 'zh-CN',
  /** 支持的区域列表 */
  supportedLocales: ['zh-CN', 'en-US', 'ja-JP'],
  /** 是否允许客户端切换区域 */
  allowLocaleSwitching: true,
  /** 翻译文件刷新间隔 (毫秒) */
  translationRefreshInterval: 3600000,
  /** 是否缓存翻译 */
  cacheTranslations: true,
  /** 缓存过期时间 (毫秒) */
  cacheExpiration: 86400000
};
```

### 8.2 中间件集成

```typescript
// src/infrastructure/middleware/localizationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import { localizationConfig } from '../config/localizationConfig';

export const setupLocalizationMiddleware = (app: any) => {
  // 初始化i18next
  i18next
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      fallbackLng: localizationConfig.defaultLocale,
      supportedLngs: localizationConfig.supportedLocales,
      detection: {
        order: ['header', 'querystring', 'cookie', 'session'],
        caches: ['cookie'],
      },
      resources: {}, // 动态加载
    });

  // 使用中间件
  app.use(i18nextMiddleware.handle(i18next));

  // 添加本地化上下文到请求
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.locale = req.language || localizationConfig.defaultLocale;
    next();
  });
};
```

## 9. 性能优化

### 9.1 翻译缓存

```typescript
// src/infrastructure/cache/TranslationCache.ts
export class TranslationCache {
  private cache: Map<string, { data: Record<string, string>; expiry: number }> = new Map();
  private readonly defaultExpiry = 86400000; // 24小时

  /**
   * 获取缓存的翻译
   * @param locale 区域代码
   * @returns 翻译数据或undefined
   */
  get(locale: string): Record<string, string> | undefined {
    const cached = this.cache.get(locale);
    if (!cached) return undefined;

    // 检查是否过期
    if (Date.now() > cached.expiry) {
      this.cache.delete(locale);
      return undefined;
    }

    return cached.data;
  }

  /**
   * 设置缓存的翻译
   * @param locale 区域代码
   * @param data 翻译数据
   * @param expiry 过期时间 (毫秒)
   */
  set(locale: string, data: Record<string, string>, expiry?: number): void {
    this.cache.set(locale, {
      data,
      expiry: Date.now() + (expiry || this.defaultExpiry)
    });
  }

  /**
   * 清除指定区域的缓存
   * @param locale 区域代码
   */
  clear(locale: string): void {
    this.cache.delete(locale);
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }
}
```

### 9.2 批量加载

```typescript
// src/application/localization/TranslationLoader.ts
export class TranslationLoader {
  constructor(
    private readonly localizationRepository: LocalizationRepository,
    private readonly translationCache: TranslationCache
  ) {}

  /**
   * 预加载所有区域的翻译
   */
  async preloadAllTranslations(): Promise<void> {
    const locales = await this.localizationRepository.getSupportedLocales();
    
    // 并行加载所有翻译
    await Promise.all(
      locales.map(async (locale) => {
        const translations = await this.localizationRepository.getTranslations(locale);
        this.translationCache.set(locale, translations);
      })
    );
  }

  /**
   * 定时刷新翻译缓存
   * @param interval 刷新间隔 (毫秒)
   */
  startAutoRefresh(interval: number): NodeJS.Timeout {
    return setInterval(async () => {
      await this.preloadAllTranslations();
    }, interval);
  }
}
```

## 10. 监控与日志

### 10.1 日志记录

```typescript
// src/infrastructure/logger/localizationLogger.ts
export interface LocalizationLogger {
  /**
   * 记录翻译请求
   * @param locale 区域代码
   * @param key 翻译键
   * @param result 翻译结果
   * @param duration 耗时 (毫秒)
   */
  logTranslationRequest(locale: string, key: string, result: string, duration: number): void;

  /**
   * 记录翻译更新
   * @param locale 区域代码
   * @param key 翻译键
   * @param oldValue 旧值
   * @param newValue 新值
   * @param user 操作用户
   */
  logTranslationUpdate(locale: string, key: string, oldValue: string, newValue: string, user: string): void;

  /**
   * 记录翻译错误
   * @param locale 区域代码
   * @param key 翻译键
   * @param error 错误信息
   */
  logTranslationError(locale: string, key: string, error: Error): void;
}
```

### 10.2 性能监控

| 监控指标 | 描述 | 监控工具 |
|----------|------|----------|
| 翻译请求耗时 | 翻译请求的平均、最大、最小耗时 | Prometheus + Grafana |
| 翻译缓存命中率 | 翻译缓存的命中情况 | Prometheus + Grafana |
| 翻译更新频率 | 翻译更新的次数 | Prometheus + Grafana |
| 区域使用分布 | 不同区域的使用情况 | Prometheus + Grafana |

## 11. 未来发展方向

### 11.1 增强功能

1. **机器翻译集成**: 自动生成初步翻译，减少人工翻译工作量
2. **翻译记忆系统**: 重用已有的翻译，提高翻译一致性
3. **翻译质量检测**: 自动检测翻译质量，标记需要人工审核的翻译
4. **支持更多格式**: 支持HTML、Markdown等富文本格式的翻译
5. **实时翻译更新**: 支持翻译的实时更新，无需重启服务

### 11.2 性能优化

1. **分布式缓存**: 使用Redis等分布式缓存，提高缓存性能和可靠性
2. **CDN加速**: 将翻译文件部署到CDN，加速客户端访问
3. **增量更新**: 支持翻译的增量更新，减少网络传输量
4. **预编译模板**: 预编译翻译模板，提高运行时渲染性能

### 11.3 扩展性

1. **插件系统**: 支持通过插件扩展本地化功能
2. **多仓库支持**: 支持同时从多个仓库获取翻译
3. **版本管理**: 支持翻译的版本控制，方便回滚和比较
4. **API网关集成**: 支持与API网关集成，实现更灵活的本地化策略

## 12. 代码组织

```
src/
├── application/
│   └── localization/
│       ├── LocalizationService.ts
│       ├── LocalizationServiceImpl.ts
│       └── TranslationLoader.ts
├── domain/
│   └── localization/
│       ├── Locale.ts
│       ├── Translation.ts
│       ├── FormattingRule.ts
│       └── LocalizationPolicy.ts
├── infrastructure/
│   ├── config/
│   │   └── localizationConfig.ts
│   ├── repository/
│   │   ├── LocalizationRepository.ts
│   │   └── FileLocalizationRepository.ts
│   ├── cache/
│   │   └── TranslationCache.ts
│   ├── middleware/
│   │   └── localizationMiddleware.ts
│   └── logger/
│       └── localizationLogger.ts
├── presentation/
│   └── controller/
│       └── LocalizationController.ts
└── utils/
    └── localization/
        ├── FormattingUtils.ts
        └── TranslationUtils.ts
```

## 13. 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 核心框架 | TypeScript | 5.x | 类型安全的JavaScript |
| 国际化框架 | i18next | 23.x | 国际化和本地化支持 |
| 日期格式化 | dayjs | 1.x | 轻量级日期时间处理 |
| 消息格式化 | intl-messageformat | 10.x | 高级消息格式化 |
| 测试框架 | Jest | 29.x | 单元测试和集成测试 |
| HTTP测试 | Supertest | 6.x | API集成测试 |
| E2E测试 | Cypress | 13.x | 端到端测试 |
| 日志 | Winston | 3.x | 日志记录 |
| 监控 | Prometheus | 2.x | 性能监控 |
| 可视化 | Grafana | 10.x | 监控数据可视化 |

## 14. 最佳实践

1. **使用语义化的翻译键**: 如 `common.button.save` 而非 `save_button`
2. **保持翻译文件的组织性**: 按功能模块或页面组织翻译键
3. **使用占位符而非硬编码**: 如 `Welcome, {name}!` 而非 `Welcome, User!`
4. **支持复数形式**: 使用 `{{count}} item` 和 `{{count}} items` 支持不同数量
5. **考虑右到左语言**: 确保UI支持RTL语言（如阿拉伯语、希伯来语）
6. **定期更新翻译**: 建立翻译更新机制，确保翻译与功能同步
7. **测试多区域支持**: 确保所有区域的功能正常工作
8. **使用专业的翻译工具**: 考虑使用专业的翻译管理系统提高效率
9. **避免在代码中硬编码文本**: 所有用户可见的文本都应该通过本地化系统
10. **提供默认翻译**: 确保每个翻译键都有默认值，避免显示空白文本

## 15. 总结

本地化系统是现代应用的重要组成部分，它能够帮助应用更好地服务全球用户。本技术实现文档详细介绍了基于Clean Architecture的本地化系统设计，包括架构设计、核心组件、数据模型、API设计、测试策略、部署配置、性能优化和监控方案。

该实现采用了分层架构，确保了系统的可维护性和可扩展性。通过使用成熟的国际化框架和工具，结合缓存、批量加载等优化技术，能够提供高效、可靠的本地化服务。

未来，该系统可以进一步增强机器翻译集成、翻译记忆系统、实时更新等功能，以适应不断变化的业务需求和用户期望。