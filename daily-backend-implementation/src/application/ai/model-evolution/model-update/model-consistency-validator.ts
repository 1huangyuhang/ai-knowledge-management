/**
 * 模型一致性验证器实现
 * 负责验证模型的一致性和完整性
 */
import { ModelConsistencyValidator, ModelConsistencyValidationResult } from '../interfaces/model-update.interface';

export class ModelConsistencyValidatorImpl implements ModelConsistencyValidator {
  /**
   * 验证模型一致性
   * @param model 认知模型
   * @returns 验证结果
   */
  async validate(model: any): Promise<ModelConsistencyValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 验证模型基本结构
    this.validateBasicStructure(model, errors, warnings);

    // 2. 验证概念一致性
    this.validateConcepts(model, errors, warnings);

    // 3. 验证关系一致性
    this.validateRelations(model, errors, warnings);

    // 4. 验证概念层次结构
    this.validateConceptHierarchy(model, errors, warnings);

    // 5. 验证关系权重
    this.validateRelationWeights(model, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date()
    };
  }

  /**
   * 验证模型基本结构
   * @param model 认知模型
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateBasicStructure(model: any, errors: string[], warnings: string[]): void {
    if (!model) {
      errors.push('Model is null or undefined');
      return;
    }

    if (!model.id) {
      errors.push('Model missing required field: id');
    }

    if (!model.userId) {
      errors.push('Model missing required field: userId');
    }

    if (!Array.isArray(model.concepts)) {
      errors.push('Model.concepts must be an array');
      model.concepts = [];
    }

    if (!Array.isArray(model.relations)) {
      errors.push('Model.relations must be an array');
      model.relations = [];
    }

    if (!model.createdAt) {
      warnings.push('Model missing optional field: createdAt');
    }

    if (!model.updatedAt) {
      warnings.push('Model missing optional field: updatedAt');
    }
  }

  /**
   * 验证概念一致性
   * @param model 认知模型
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateConcepts(model: any, errors: string[], warnings: string[]): void {
    if (!model.concepts || model.concepts.length === 0) {
      warnings.push('Model has no concepts');
      return;
    }

    const conceptIds = new Set<string>();
    const conceptNames = new Set<string>();

    for (const concept of model.concepts) {
      // 验证概念基本字段
      if (!concept.id) {
        errors.push('Concept missing required field: id');
        continue;
      }

      if (!concept.name) {
        errors.push(`Concept ${concept.id} missing required field: name`);
      }

      // 验证概念ID唯一性
      if (conceptIds.has(concept.id)) {
        errors.push(`Duplicate concept ID found: ${concept.id}`);
      } else {
        conceptIds.add(concept.id);
      }

      // 验证概念名称唯一性
      if (concept.name && conceptNames.has(concept.name)) {
        warnings.push(`Duplicate concept name found: ${concept.name}`);
      } else if (concept.name) {
        conceptNames.add(concept.name);
      }

      // 验证概念数据类型
      if (concept.weight !== undefined && (typeof concept.weight !== 'number' || isNaN(concept.weight))) {
        errors.push(`Concept ${concept.id} has invalid weight: ${concept.weight}`);
      }

      if (concept.confidence !== undefined && (typeof concept.confidence !== 'number' || isNaN(concept.confidence))) {
        errors.push(`Concept ${concept.id} has invalid confidence: ${concept.confidence}`);
      }
    }
  }

  /**
   * 验证关系一致性
   * @param model 认知模型
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateRelations(model: any, errors: string[], warnings: string[]): void {
    if (!model.relations || model.relations.length === 0) {
      warnings.push('Model has no relations');
      return;
    }

    const conceptIds = new Set(model.concepts.map((c: any) => c.id));
    const relationIds = new Set<string>();

    for (const relation of model.relations) {
      // 验证关系基本字段
      if (!relation.id) {
        errors.push('Relation missing required field: id');
        continue;
      }

      if (!relation.fromConceptId) {
        errors.push(`Relation ${relation.id} missing required field: fromConceptId`);
      }

      if (!relation.toConceptId) {
        errors.push(`Relation ${relation.id} missing required field: toConceptId`);
      }

      // 验证关系ID唯一性
      if (relationIds.has(relation.id)) {
        errors.push(`Duplicate relation ID found: ${relation.id}`);
      } else {
        relationIds.add(relation.id);
      }

      // 验证关系指向的概念存在
      if (relation.fromConceptId && !conceptIds.has(relation.fromConceptId)) {
        errors.push(`Relation ${relation.id} references non-existent concept: ${relation.fromConceptId}`);
      }

      if (relation.toConceptId && !conceptIds.has(relation.toConceptId)) {
        errors.push(`Relation ${relation.id} references non-existent concept: ${relation.toConceptId}`);
      }

      // 验证关系类型
      if (!relation.type) {
        warnings.push(`Relation ${relation.id} missing optional field: type`);
      }

      // 验证关系数据类型
      if (relation.weight !== undefined && (typeof relation.weight !== 'number' || isNaN(relation.weight))) {
        errors.push(`Relation ${relation.id} has invalid weight: ${relation.weight}`);
      }

      if (relation.confidence !== undefined && (typeof relation.confidence !== 'number' || isNaN(relation.confidence))) {
        errors.push(`Relation ${relation.id} has invalid confidence: ${relation.confidence}`);
      }
    }
  }

  /**
   * 验证概念层次结构
   * @param model 认知模型
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateConceptHierarchy(model: any, errors: string[], warnings: string[]): void {
    if (!model.concepts || model.concepts.length === 0) {
      return;
    }

    const conceptIds = new Set(model.concepts.map((c: any) => c.id));
    const parentChildMap = new Map<string, string[]>();

    // 构建父子关系映射
    for (const concept of model.concepts) {
      if (concept.parentId) {
        if (!conceptIds.has(concept.parentId)) {
          errors.push(`Concept ${concept.id} has invalid parentId: ${concept.parentId}`);
        } else {
          if (!parentChildMap.has(concept.parentId)) {
            parentChildMap.set(concept.parentId, []);
          }
          parentChildMap.get(concept.parentId)?.push(concept.id);
        }
      }
    }

    // 检测循环依赖
    this.detectCircularDependencies(model.concepts, parentChildMap, errors);

    // 检测过深的层次结构
    this.detectDeepHierarchy(model.concepts, parentChildMap, warnings);
  }

  /**
   * 检测循环依赖
   * @param concepts 概念列表
   * @param parentChildMap 父子关系映射
   * @param errors 错误列表
   */
  private detectCircularDependencies(concepts: any[], parentChildMap: Map<string, string[]>, errors: string[]): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const detectCycle = (conceptId: string): void => {
      if (recursionStack.has(conceptId)) {
        const cycleStartIndex = path.indexOf(conceptId);
        if (cycleStartIndex !== -1) {
          const cycle = [...path.slice(cycleStartIndex), conceptId].join(' -> ');
          errors.push(`Circular dependency detected: ${cycle}`);
        }
        return;
      }

      if (visited.has(conceptId)) {
        return;
      }

      visited.add(conceptId);
      recursionStack.add(conceptId);
      path.push(conceptId);

      const children = parentChildMap.get(conceptId) || [];
      for (const childId of children) {
        detectCycle(childId);
      }

      recursionStack.delete(conceptId);
      path.pop();
    };

    for (const concept of concepts) {
      if (!visited.has(concept.id)) {
        detectCycle(concept.id);
      }
    }
  }

  /**
   * 检测过深的层次结构
   * @param concepts 概念列表
   * @param parentChildMap 父子关系映射
   * @param warnings 警告列表
   */
  private detectDeepHierarchy(concepts: any[], parentChildMap: Map<string, string[]>, warnings: string[]): void {
    const maxDepth = 10; // 最大允许的层次深度
    const depthMap = new Map<string, number>();

    const calculateDepth = (conceptId: string): number => {
      if (depthMap.has(conceptId)) {
        return depthMap.get(conceptId)!;
      }

      const concept = concepts.find((c: any) => c.id === conceptId);
      if (!concept || !concept.parentId) {
        depthMap.set(conceptId, 0);
        return 0;
      }

      const parentDepth = calculateDepth(concept.parentId);
      const depth = parentDepth + 1;
      depthMap.set(conceptId, depth);

      if (depth > maxDepth) {
        warnings.push(`Concept ${conceptId} has excessive depth: ${depth} (max allowed: ${maxDepth})`);
      }

      return depth;
    };

    for (const concept of concepts) {
      calculateDepth(concept.id);
    }
  }

  /**
   * 验证关系权重
   * @param model 认知模型
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateRelationWeights(model: any, errors: string[], warnings: string[]): void {
    if (!model.relations || model.relations.length === 0) {
      return;
    }

    for (const relation of model.relations) {
      if (relation.weight !== undefined) {
        if (relation.weight < 0 || relation.weight > 1) {
          warnings.push(`Relation ${relation.id} has weight outside recommended range [0, 1]: ${relation.weight}`);
        }
      }

      if (relation.confidence !== undefined) {
        if (relation.confidence < 0 || relation.confidence > 1) {
          warnings.push(`Relation ${relation.id} has confidence outside recommended range [0, 1]: ${relation.confidence}`);
        }
      }
    }
  }
}