# tsconfig.json 配置示例
#配置管理 #TypeScript #tsconfig #编译选项 #开发支持

## 1. 文档概述

本文档提供了AI认知辅助系统的tsconfig.json配置示例，包含了所有必要的TypeScript编译选项，用于支持项目的开发、测试和生产构建。

### 1.1 相关文档

- [开发环境设置](development-environment-setup.md) - 开发环境配置指南
- [开发规范](development-standards.md) - 系统开发规范
- [package.json配置示例](package-json-example.md) - package.json配置示例
- [API使用示例](api-usage-examples.md) - API使用示例和最佳实践

## 2. 完整配置示例

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "ES2020",                          /* 指定ECMAScript目标版本: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */
    "module": "commonjs",                        /* 指定模块代码生成: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
    "lib": ["ES2020"],                         /* 指定要包含在编译中的库文件 */
    "allowJs": true,                             /* 允许编译JavaScript文件 */
    "checkJs": true,                             /* 在JavaScript文件中报告错误 */
    "jsx": "preserve",                          /* 指定JSX代码生成: 'preserve', 'react-native', or 'react'. */
    "declaration": true,                         /* 生成相应的.d.ts文件 */
    "declarationMap": true,                      /* 为每个对应的.d.ts文件生成sourcemap */
    "sourceMap": true,                           /* 生成相应的.map文件 */
    "outDir": "./dist",                        /* 重定向输出结构到目录 */
    "rootDir": "./src",                        /* 指定输入文件的根目录，用于控制输出目录结构 */
    "removeComments": false,                     /* 移除所有注释，除了以/!*开头的注释 */
    "noEmit": false,                            /* 不生成输出文件 */
    "importHelpers": true,                       /* 从tslib导入辅助工具函数 */
    "downlevelIteration": true,                  /* 为ES5和ES3目标启用迭代器 */
    "isolatedModules": true,                     /* 每个文件必须是模块 */

    /* 严格类型检查选项 */
    "strict": true,                              /* 启用所有严格类型检查选项 */
    "noImplicitAny": true,                       /* 在表达式和声明中隐含any类型时报错 */
    "strictNullChecks": true,                   /* 启用严格的null检查 */
    "strictFunctionTypes": true,                /* 启用函数类型的严格检查 */
    "strictBindCallApply": true,                /* 启用bind, call, apply方法的严格检查 */
    "strictPropertyInitialization": true,       /* 启用类属性初始化的严格检查 */
    "noImplicitThis": true,                     /* 当this表达式值为any类型时报错 */
    "alwaysStrict": true,                       /* 在严格模式下解析并为每个源文件生成"use strict" */

    /* 额外的检查 */
    "noUnusedLocals": true,                      /* 未使用的局部变量时报错 */
    "noUnusedParameters": true,                 /* 未使用的参数时报错 */
    "noImplicitReturns": true,                  /* 函数在所有代码路径上都有返回值时报错 */
    "noFallthroughCasesInSwitch": true,         /* 防止switch语句中的case穿透 */
    "noUncheckedIndexedAccess": true,           /* 对索引访问进行更严格的检查 */
    "noPropertyAccessFromIndexSignature": true, /* 防止从索引签名访问属性 */

    /* 模块解析选项 */
    "moduleResolution": "node",                 /* 指定模块解析策略: 'node' (Node.js) or 'classic' (TypeScript pre-1.6) */
    "baseUrl": ".",                            /* 用于解析非绝对模块名称的基目录 */
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@presentation/*": ["./src/presentation/*"],
      "@ai/*": ["./src/ai/*"],
      "@/*": ["./src/*"]
    },                                          /* 模块名到基于baseUrl的路径映射 */
    "rootDirs": [],                             /* 根文件夹列表，其组合内容表示运行时项目结构 */
    "typeRoots": ["./node_modules/@types"],    /* 类型声明文件的位置 */
    "types": ["node", "jest"],                 /* 要包含的类型声明文件列表 */
    "allowSyntheticDefaultImports": true,       /* 允许从没有默认导出的模块进行默认导入 */
    "esModuleInterop": true,                     /* 启用CommonJS和ES模块之间的互操作性 */
    "preserveSymlinks": true,                    /* 不解析符号链接的真实路径 */

    /* Source Map选项 */
    "sourceRoot": "./src",                      /* 指定调试器应该找到TypeScript文件而不是源文件的位置 */
    "mapRoot": "./dist",                       /* 指定调试器应该找到映射文件而不是生成文件的位置 */
    "inlineSourceMap": false,                   /* 生成单个内联sourcemap */
    "inlineSources": false,                     /* 让sourcemap包含源代码内容 */

    /* 实验性选项 */
    "experimentalDecorators": true,             /* 启用实验性的装饰器支持 */
    "emitDecoratorMetadata": true,              /* 为装饰器类型发出设计类型元数据 */
    "skipLibCheck": true,                       /* 跳过声明文件的类型检查 */
    "forceConsistentCasingInFileNames": true,   /* 确保文件名的大小写一致性 */
    "resolveJsonModule": true,                  /* 允许导入.json文件 */
    "allowImportingTsExtensions": true          /* 允许导入.ts, .tsx, .mts, .cts文件 */
  },
  "include": ["src/**/*"],                      /* 要包含在编译中的文件列表 */
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],  /* 要从编译中排除的文件列表 */
  "references": [{ "path": "./tsconfig.build.json" }]  /* 项目引用 */
}
```

## 3. 编译配置（tsconfig.build.json）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"]
}
```

## 4. 测试配置（tsconfig.test.json）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src/**/*", "**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"],
  "exclude": ["node_modules", "dist"]
}
```

## 5. 配置说明

### 5.1 基本选项

- **target**: 指定ECMAScript目标版本，本项目使用ES2020，兼容Node.js 14+版本
- **module**: 指定模块代码生成方式，使用commonjs，符合Node.js模块系统
- **lib**: 指定编译时包含的库文件，使用ES2020
- **outDir**: 输出目录，指向编译后的dist目录
- **rootDir**: 输入文件的根目录，指向src目录

### 5.2 严格类型检查选项

- **strict**: 启用所有严格类型检查选项，确保类型安全
- **noImplicitAny**: 防止隐式any类型，提高代码类型安全性
- **strictNullChecks**: 严格的null检查，防止null和undefined相关的运行时错误
- **strictPropertyInitialization**: 严格的类属性初始化检查，确保类属性在构造函数中初始化

### 5.3 额外的检查

- **noUnusedLocals**: 检测未使用的局部变量，保持代码整洁
- **noUnusedParameters**: 检测未使用的参数，保持代码整洁
- **noImplicitReturns**: 确保函数在所有路径上都有返回值
- **noFallthroughCasesInSwitch**: 防止switch语句中的case穿透

### 5.4 模块解析选项

- **moduleResolution**: 使用node模块解析策略，符合Node.js的模块解析规则
- **baseUrl**: 模块解析的基目录，设置为项目根目录
- **paths**: 模块路径别名，简化导入路径，提高代码可读性
  - `@domain/*`: 指向src/domain目录
  - `@application/*`: 指向src/application目录
  - `@infrastructure/*`: 指向src/infrastructure目录
  - `@presentation/*`: 指向src/presentation目录
  - `@ai/*`: 指向src/ai目录
  - `@/*`: 指向src目录
- **esModuleInterop**: 启用CommonJS和ES模块之间的互操作性
- **resolveJsonModule**: 允许导入.json文件

### 5.5 实验性选项

- **experimentalDecorators**: 启用装饰器支持，用于依赖注入等功能
- **emitDecoratorMetadata**: 为装饰器类型发出设计类型元数据，用于依赖注入容器

### 5.6 包含和排除

- **include**: 包含src目录下的所有文件
- **exclude**: 排除node_modules、dist目录和测试文件

## 6. 多配置文件策略

本项目采用多配置文件策略，根据不同的使用场景提供不同的配置：

1. **tsconfig.json**: 主配置文件，包含所有基本配置
2. **tsconfig.build.json**: 构建配置，用于生产构建，生成声明文件和sourcemap
3. **tsconfig.test.json**: 测试配置，用于运行测试，不生成输出文件

## 7. 使用说明

### 7.1 类型检查

```bash
# 运行类型检查
npx tsc --noEmit

# 使用测试配置运行类型检查
npx tsc --noEmit -p tsconfig.test.json
```

### 7.2 构建项目

```bash
# 使用构建配置构建项目
npx tsc -p tsconfig.build.json
```

### 7.3 与其他工具配合使用

#### 7.3.1 与ESLint配合

在.eslintrc.json中添加：

```json
{
  "parserOptions": {
    "project": ["./tsconfig.json"]
  }
}
```

#### 7.3.2 与Jest配合

在jest.config.js中添加：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>'],
  moduleNameMapping: {
    '@domain/(.*)': '<rootDir>/src/domain/$1',
    '@application/(.*)': '<rootDir>/src/application/$1',
    '@infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
    '@presentation/(.*)': '<rootDir>/src/presentation/$1',
    '@ai/(.*)': '<rootDir>/src/ai/$1',
    '@/(.*)': '<rootDir>/src/$1'
  }
};
```

## 8. 配置最佳实践

1. **使用严格模式**: 启用所有严格类型检查选项，提高代码质量和类型安全性
2. **合理使用路径别名**: 使用路径别名简化导入路径，提高代码可读性
3. **采用多配置文件策略**: 根据不同场景使用不同的配置文件，提高构建效率
4. **与其他工具配合**: 确保TypeScript配置与ESLint、Jest等工具配合良好
5. **定期更新配置**: 随着TypeScript版本更新，定期更新配置选项

## 9. 常见问题与解决方案

### 9.1 装饰器错误

**问题**: 装饰器相关的编译错误
**解决方案**: 确保启用了以下选项：
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### 9.2 路径别名无法解析

**问题**: 路径别名在运行时无法解析
**解决方案**: 使用tsconfig-paths或tsx等工具来处理路径别名

### 9.3 类型声明文件缺失

**问题**: 缺少依赖的类型声明文件
**解决方案**: 安装相应的@types包，或在typeRoots中添加类型声明文件目录

## 10. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
