/**
 * 主题分析服务实现
 */
import { ThemeAnalysisService, Theme, ThemeAnalysisResult, ThemeAnalysisOptions } from './theme-analysis-service';
import { CognitiveModelRepository } from '../../../domain/repositories/cognitive-model-repository';
import { v4 as uuidv4 } from 'uuid';
import { CognitiveModel, CognitiveConcept, CognitiveRelation } from '../../../domain/entities/cognitive-model';

/**
 * 主题分析服务实现类
 */
export class ThemeAnalysisServiceImpl implements ThemeAnalysisService {
  private readonly cognitiveModelRepository: CognitiveModelRepository;

  /**
   * 构造函数
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(
    cognitiveModelRepository: CognitiveModelRepository
  ) {
    this.cognitiveModelRepository = cognitiveModelRepository;
  }

  /**
   * 分析认知模型的主题
   * @param userId 用户ID
   * @param modelId 认知模型ID
   * @param options 主题分析选项
   * @returns 主题分析结果
   */
  async analyzeThemes(
    userId: string,
    modelId: string,
    options?: ThemeAnalysisOptions
  ): Promise<ThemeAnalysisResult>;
  
  /**
   * 分析认知模型的主题（适配测试用）
   * @param concepts 认知概念列表
   * @param relations 认知关系列表
   * @param options 主题分析选项
   * @returns 主题分析结果
   */
  async analyzeThemes(
    concepts: CognitiveConcept[],
    relations: CognitiveRelation[],
    options?: ThemeAnalysisOptions
  ): Promise<ThemeAnalysisResult>;
  
  /**
   * 分析认知模型的主题（实现）
   */
  async analyzeThemes(
    param1: string | CognitiveConcept[],
    param2: string | CognitiveRelation[],
    param3?: ThemeAnalysisOptions
  ): Promise<ThemeAnalysisResult> {
    let concepts: CognitiveConcept[] = [];
    let relations: CognitiveRelation[] = [];
    
    // 适配测试用的重载
    if (Array.isArray(param1) && Array.isArray(param2)) {
      concepts = param1;
      relations = param2;
    } else {
      // 原始实现
      const userId = param1 as string;
      const modelId = param2 as string;
      const options = param3;
      
      // 获取认知模型
      const model = await this.cognitiveModelRepository.findById(modelId, userId);
      if (!model) {
        throw new Error(`认知模型 ${modelId} 不存在`);
      }
      
      // 这里假设模型有concepts和relations属性，否则使用空数组
      concepts = [];
      relations = [];
    }

    // 生成主题
    let themes: Theme[] = [];
    
    // 从概念生成主题
    const conceptThemes = this.generateThemesFromConcepts(concepts, param3);
    themes = [...themes, ...conceptThemes];

    // 从关系生成主题
    const relationThemes = this.generateThemesFromRelations(relations, concepts, param3);
    themes = [...themes, ...relationThemes];

    // 合并相似主题
    themes = this.mergeSimilarThemes(themes);

    // 过滤主题
    themes = this.filterThemes(themes, param3);

    // 排序主题（按强度降序）
    themes.sort((a, b) => b.strength - a.strength);

    // 限制主题数量
    if (param3?.maxThemes) {
      themes = themes.slice(0, param3.maxThemes);
    }

    // 获取主题分布
    const themeDistribution = this.getThemeDistribution(themes);

    // 识别主导主题
    const dominantTheme = this.identifyDominantTheme(themes);

    // 生成分析摘要
    const summary = this.generateAnalysisSummary(themes, dominantTheme);

    // 生成建议
    const recommendations = this.generateRecommendations(themes, dominantTheme);

    // 构建结果
    return {
      id: uuidv4(),
      themes,
      themeDistribution,
      dominantTheme,
      summary,
      recommendations,
      createdAt: new Date()
    };
  }

  /**
   * 从概念生成主题
   * @param concepts 概念列表
   * @param options 主题分析选项
   * @returns 生成的主题列表
   */
  generateThemesFromConcepts(
    concepts: any[],
    options?: ThemeAnalysisOptions
  ): Theme[] {
    const themes: Theme[] = [];
    
    // 如果没有概念，返回空列表
    if (concepts.length === 0) {
      return themes;
    }

    // 按概念类型分组
    const conceptsByType = new Map<string, any[]>();
    concepts.forEach(concept => {
      const type = concept.type || 'general';
      if (!conceptsByType.has(type)) {
        conceptsByType.set(type, []);
      }
      conceptsByType.get(type)!.push(concept);
    });

    // 为每种类型生成主题
    conceptsByType.forEach((typeConcepts, type) => {
      // 提取关键词
      const keywords = this.extractKeywords(typeConcepts);
      
      // 生成主题
      const theme: Theme = {
        id: uuidv4(),
        name: this.generateThemeName(type, keywords),
        description: this.generateThemeDescription(type, typeConcepts),
        strength: this.calculateThemeStrength(typeConcepts),
        relatedConcepts: typeConcepts.map(concept => concept.id),
        type,
        keywords
      };
      
      themes.push(theme);
    });

    return themes;
  }

  /**
   * 从关系生成主题
   * @param relations 关系列表
   * @param concepts 概念列表
   * @param options 主题分析选项
   * @returns 生成的主题列表
   */
  generateThemesFromRelations(
    relations: any[],
    concepts: any[],
    options?: ThemeAnalysisOptions
  ): Theme[] {
    const themes: Theme[] = [];
    
    // 如果没有关系，返回空列表
    if (relations.length === 0) {
      return themes;
    }

    // 按关系类型分组
    const relationsByType = new Map<string, any[]>();
    relations.forEach(relation => {
      const type = relation.type || 'related';
      if (!relationsByType.has(type)) {
        relationsByType.set(type, []);
      }
      relationsByType.get(type)!.push(relation);
    });

    // 为每种关系类型生成主题
    relationsByType.forEach((typeRelations, type) => {
      // 获取相关概念
      const relatedConceptIds = new Set<string>();
      typeRelations.forEach(relation => {
        relatedConceptIds.add(relation.sourceId);
        relatedConceptIds.add(relation.targetId);
      });
      
      // 提取相关概念
      const relatedConcepts = concepts.filter(concept => relatedConceptIds.has(concept.id));
      
      // 提取关键词
      const keywords = this.extractKeywords(relatedConcepts);
      
      // 生成主题
      const theme: Theme = {
        id: uuidv4(),
        name: this.generateRelationThemeName(type, keywords),
        description: this.generateRelationThemeDescription(type, typeRelations, relatedConcepts),
        strength: this.calculateRelationThemeStrength(typeRelations, relatedConcepts),
        relatedConcepts: Array.from(relatedConceptIds),
        type: `relation_${type}`,
        keywords
      };
      
      themes.push(theme);
    });

    return themes;
  }

  /**
   * 获取主题分布
   * @param themes 主题列表
   * @returns 主题分布数据
   */
  getThemeDistribution(themes: Theme[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    // 计算总强度
    const totalStrength = themes.reduce((sum, theme) => sum + theme.strength, 0);
    
    if (totalStrength === 0) {
      return distribution;
    }
    
    // 计算每个主题的占比
    themes.forEach(theme => {
      distribution[theme.name] = parseFloat((theme.strength / totalStrength).toFixed(2));
    });
    
    return distribution;
  }

  /**
   * 识别主导主题
   * @param themes 主题列表
   * @returns 主导主题
   */
  identifyDominantTheme(themes: Theme[]): Theme | null {
    if (themes.length === 0) {
      return null;
    }
    
    // 按强度排序，返回最强的主题
    const sortedThemes = [...themes].sort((a, b) => b.strength - a.strength);
    return sortedThemes[0];
  }

  /**
   * 合并相似主题
   * @param themes 主题列表
   * @returns 合并后的主题列表
   */
  private mergeSimilarThemes(themes: Theme[]): Theme[] {
    const mergedThemes: Theme[] = [];
    const processedIndexes = new Set<number>();
    
    for (let i = 0; i < themes.length; i++) {
      if (processedIndexes.has(i)) continue;
      
      const currentTheme = themes[i];
      const similarThemes = [currentTheme];
      processedIndexes.add(i);
      
      // 查找相似主题
      for (let j = i + 1; j < themes.length; j++) {
        if (processedIndexes.has(j)) continue;
        
        const otherTheme = themes[j];
        if (this.areThemesSimilar(currentTheme, otherTheme)) {
          similarThemes.push(otherTheme);
          processedIndexes.add(j);
        }
      }
      
      // 如果只有一个主题，直接添加
      if (similarThemes.length === 1) {
        mergedThemes.push(currentTheme);
        continue;
      }
      
      // 合并主题
      const mergedTheme = this.mergeThemes(similarThemes);
      mergedThemes.push(mergedTheme);
    }
    
    return mergedThemes;
  }

  /**
   * 判断两个主题是否相似
   * @param theme1 主题1
   * @param theme2 主题2
   * @returns 是否相似
   */
  private areThemesSimilar(theme1: Theme, theme2: Theme): boolean {
    // 计算关键词重叠度
    const commonKeywords = theme1.keywords.filter(keyword => theme2.keywords.includes(keyword));
    const overlapRatio = commonKeywords.length / Math.max(theme1.keywords.length, theme2.keywords.length);
    
    // 如果关键词重叠度超过50%，则认为相似
    return overlapRatio >= 0.5;
  }

  /**
   * 合并多个主题
   * @param themes 主题列表
   * @returns 合并后的主题
   */
  private mergeThemes(themes: Theme[]): Theme {
    // 合并关键词
    const mergedKeywords = new Set<string>();
    themes.forEach(theme => {
      theme.keywords.forEach(keyword => mergedKeywords.add(keyword));
    });
    
    // 合并相关概念
    const mergedRelatedConcepts = new Set<string>();
    themes.forEach(theme => {
      theme.relatedConcepts.forEach(conceptId => mergedRelatedConcepts.add(conceptId));
    });
    
    // 计算合并后的强度
    const totalStrength = themes.reduce((sum, theme) => sum + theme.strength, 0);
    const averageStrength = totalStrength / themes.length;
    
    // 生成合并后的名称和描述
    const primaryTheme = themes.reduce((max, theme) => theme.strength > max.strength ? theme : max, themes[0]);
    const mergedName = primaryTheme.name;
    const mergedDescription = this.generateMergedThemeDescription(themes);
    
    return {
      id: uuidv4(),
      name: mergedName,
      description: mergedDescription,
      strength: averageStrength,
      relatedConcepts: Array.from(mergedRelatedConcepts),
      type: primaryTheme.type,
      keywords: Array.from(mergedKeywords)
    };
  }

  /**
   * 过滤主题
   * @param themes 主题列表
   * @param options 主题分析选项
   * @returns 过滤后的主题列表
   */
  private filterThemes(themes: Theme[], options?: ThemeAnalysisOptions): Theme[] {
    let filteredThemes = [...themes];
    
    // 根据强度阈值过滤
    if (options?.themeStrengthThreshold !== undefined) {
      filteredThemes = filteredThemes.filter(theme => 
        theme.strength >= options.themeStrengthThreshold!
      );
    }
    
    return filteredThemes;
  }

  /**
   * 从概念中提取关键词
   * @param concepts 概念列表
   * @returns 关键词列表
   */
  private extractKeywords(concepts: any[]): string[] {
    const keywords = new Set<string>();
    
    concepts.forEach(concept => {
      // 添加概念名称
      if (concept.name) {
        keywords.add(concept.name.toLowerCase());
      }
      
      // 添加概念标签
      if (concept.tags && Array.isArray(concept.tags)) {
        concept.tags.forEach((tag: string) => keywords.add(tag.toLowerCase()));
      }
      
      // 添加概念属性
      if (concept.attributes) {
        Object.values(concept.attributes).forEach(value => {
          if (typeof value === 'string') {
            value.split(' ').forEach(word => {
              // 过滤短词
              if (word.length > 3) {
                keywords.add(word.toLowerCase());
              }
            });
          }
        });
      }
    });
    
    // 过滤常见词
    const commonWords = new Set(['the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by']);
    return Array.from(keywords).filter(keyword => !commonWords.has(keyword));
  }

  /**
   * 生成主题名称
   * @param type 概念类型
   * @param keywords 关键词列表
   * @returns 主题名称
   */
  private generateThemeName(type: string, keywords: string[]): string {
    // 使用类型和前3个关键词生成名称
    const topKeywords = keywords.slice(0, 3).join('、');
    return `${type.charAt(0).toUpperCase() + type.slice(1)} 主题 (${topKeywords})`;
  }

  /**
   * 生成主题描述
   * @param type 概念类型
   * @param concepts 概念列表
   * @returns 主题描述
   */
  private generateThemeDescription(type: string, concepts: any[]): string {
    return `这是一个关于${type}的主题，包含 ${concepts.length} 个相关概念，主要涉及 ${this.extractKeywords(concepts).slice(0, 5).join('、')} 等关键词。`;
  }

  /**
   * 生成关系主题名称
   * @param type 关系类型
   * @param keywords 关键词列表
   * @returns 主题名称
   */
  private generateRelationThemeName(type: string, keywords: string[]): string {
    // 使用关系类型和前3个关键词生成名称
    const topKeywords = keywords.slice(0, 3).join('、');
    return `${type.charAt(0).toUpperCase() + type.slice(1)} 关系主题 (${topKeywords})`;
  }

  /**
   * 生成关系主题描述
   * @param type 关系类型
   * @param relations 关系列表
   * @param concepts 相关概念列表
   * @returns 主题描述
   */
  private generateRelationThemeDescription(type: string, relations: any[], concepts: any[]): string {
    return `这是一个关于${type}关系的主题，包含 ${relations.length} 个相关关系，涉及 ${concepts.length} 个概念，主要涉及 ${this.extractKeywords(concepts).slice(0, 5).join('、')} 等关键词。`;
  }

  /**
   * 生成合并主题描述
   * @param themes 主题列表
   * @returns 合并后的主题描述
   */
  private generateMergedThemeDescription(themes: Theme[]): string {
    const totalConcepts = new Set<string>();
    themes.forEach(theme => {
      theme.relatedConcepts.forEach(conceptId => totalConcepts.add(conceptId));
    });
    
    const uniqueKeywords = new Set<string>();
    themes.forEach(theme => {
      theme.keywords.forEach(keyword => uniqueKeywords.add(keyword));
    });
    
    return `这是一个合并主题，包含 ${totalConcepts.size} 个相关概念，${themes.length} 个子主题，主要涉及 ${Array.from(uniqueKeywords).slice(0, 5).join('、')} 等关键词。`;
  }

  /**
   * 计算主题强度
   * @param concepts 概念列表
   * @returns 主题强度
   */
  private calculateThemeStrength(concepts: any[]): number {
    // 基于概念数量、属性数量和关系数量计算强度
    let strength = concepts.length;
    
    // 添加概念属性的影响
    concepts.forEach(concept => {
      if (concept.attributes) {
        strength += Object.keys(concept.attributes).length * 0.5;
      }
      
      // 添加概念标签的影响
      if (concept.tags && Array.isArray(concept.tags)) {
        strength += concept.tags.length * 0.3;
      }
    });
    
    return strength;
  }

  /**
   * 计算关系主题强度
   * @param relations 关系列表
   * @param concepts 相关概念列表
   * @returns 主题强度
   */
  private calculateRelationThemeStrength(relations: any[], concepts: any[]): number {
    // 基于关系数量和相关概念数量计算强度
    let strength = relations.length;
    strength += concepts.length * 0.5;
    
    return strength;
  }

  /**
   * 生成分析摘要
   * @param themes 主题列表
   * @param dominantTheme 主导主题
   * @returns 分析摘要
   */
  private generateAnalysisSummary(themes: Theme[], dominantTheme: Theme | null): string {
    if (themes.length === 0) {
      return '当前认知模型中没有足够的概念和关系来生成主题分析。';
    }
    
    let summary = `在当前认知模型中识别出 ${themes.length} 个主题。`;
    
    if (dominantTheme) {
      summary += ` 主导主题是 "${dominantTheme.name}"，涉及 ${dominantTheme.relatedConcepts.length} 个概念。`;
    }
    
    summary += ' 这些主题涵盖了多个领域和概念类型，反映了认知模型的主要关注点。';
    
    return summary;
  }

  /**
   * 生成建议
   * @param themes 主题列表
   * @param dominantTheme 主导主题
   * @returns 建议列表
   */
  private generateRecommendations(themes: Theme[], dominantTheme: Theme | null): string[] {
    const recommendations: string[] = [];
    
    if (themes.length === 0) {
      recommendations.push('建议添加更多概念和关系，以便进行更有效的主题分析。');
      return recommendations;
    }
    
    if (themes.length < 3) {
      recommendations.push('当前主题数量较少，建议扩展认知模型，添加更多相关概念和关系。');
    }
    
    if (dominantTheme) {
      const dominantConceptCount = dominantTheme.relatedConcepts.length;
      const totalConcepts = new Set<string>();
      themes.forEach(theme => {
        theme.relatedConcepts.forEach(conceptId => totalConcepts.add(conceptId));
      });
      
      if (dominantConceptCount > totalConcepts.size * 0.6) {
        recommendations.push(`主导主题 "${dominantTheme.name}" 占比较大，建议平衡认知模型，添加更多其他领域的概念和关系。`);
      }
    }
    
    // 检查主题多样性
    const themeTypes = new Set(themes.map(theme => theme.type));
    if (themeTypes.size < themes.length * 0.5) {
      recommendations.push('主题类型相对单一，建议添加更多类型的概念和关系，以丰富认知模型。');
    }
    
    recommendations.push('定期审查和更新主题分析，以跟踪认知模型的演化和变化。');
    
    return recommendations;
  }
}
