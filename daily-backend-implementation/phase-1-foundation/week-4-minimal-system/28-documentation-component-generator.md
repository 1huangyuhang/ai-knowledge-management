# Day 28: 第一阶段 - 系统地基期 - Week 4 - 第28天 代码实现

## 组件文档生成器

```typescript
// src/documentation/ComponentDocumentationGenerator.ts

import { writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { SystemComponents } from '../infrastructure/system/SystemIntegrator';

/**
 * 组件文档生成器配置
 */
export interface ComponentDocumentationGeneratorConfig {
  outputPath: string;
  sourcePaths: string[];
}

/**
 * 组件文档生成器
 */
export class ComponentDocumentationGenerator {
  private readonly config: ComponentDocumentationGeneratorConfig;
  private readonly components: SystemComponents;

  /**
   * 创建组件文档生成器
   * @param components 系统组件
   * @param config 生成器配置
   */
  constructor(components: SystemComponents, config: ComponentDocumentationGeneratorConfig) {
    this.components = components;
    this.config = {
      outputPath: './docs/components',
      sourcePaths: ['./src'],
      ...config,
    };
  }

  /**
   * 生成组件文档
   */
  public generate(): void {
    try {
      // 创建输出目录
      mkdirSync(this.config.outputPath, { recursive: true });

      // 遍历源代码目录
      this.config.sourcePaths.forEach(sourcePath => {
        this.processDirectory(sourcePath);
      });

      // 生成组件索引
      this.generateComponentIndex();

      this.components.loggingSystem.logInfo('Component documentation generated successfully', {
        outputPath: this.config.outputPath,
      });
    } catch (error: any) {
      this.components.loggingSystem.logError('Failed to generate component documentation', error);
      throw error;
    }
  }

  /**
   * 处理目录
   * @param dirPath 目录路径
   */
  private processDirectory(dirPath: string): void {
    const entries = readdirSync(dirPath);

    entries.forEach(entry => {
      const entryPath = join(dirPath, entry);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        // 跳过 node_modules 和其他不需要的目录
        if (entry === 'node_modules' || entry === 'dist' || entry === '.git') {
          return;
        }
        this.processDirectory(entryPath);
      } else if (stats.isFile() && entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        // 处理 TypeScript 文件
        this.processFile(entryPath);
      }
    });
  }

  /**
   * 处理文件
   * @param filePath 文件路径
   */
  private processFile(filePath: string): void {
    // 这里可以实现更复杂的文件处理逻辑
    // 例如：提取类定义、方法、属性等
    
    // 简单示例：生成文件概述
    const componentName = basename(filePath, '.ts');
    const outputPath = join(this.config.outputPath, `${componentName}.md`);
    
    const content = `# ${componentName}\n\n` +
      `## 概述\n\n` +
      `文件路径：${filePath}\n\n` +
      `## 功能描述\n\n` +
      `（自动生成的功能描述）\n\n` +
      `## API 参考\n\n` +
      `（自动生成的 API 参考）\n\n`;
    
    writeFileSync(outputPath, content);
  }

  /**
   * 生成组件索引
   */
  private generateComponentIndex(): void {
    const indexPath = join(this.config.outputPath, 'index.md');
    const files = readdirSync(this.config.outputPath)
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort();

    let content = `# 组件文档索引\n\n`;
    content += `本文件包含了系统中所有组件的文档链接。\n\n`;
    content += `## 组件列表\n\n`;

    files.forEach(file => {
      const componentName = basename(file, '.md');
      content += `- [${componentName}](${file})\n`;
    });

    writeFileSync(indexPath, content);
  }
}
```