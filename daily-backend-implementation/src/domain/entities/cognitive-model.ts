/**
 * 认知模型实体
 * 代表用户的认知结构模型，包含用户的所有认知概念和关系
 */
import { UUID } from '../value-objects/uuid';

export class CognitiveModel {
  private readonly id: UUID;
  private readonly userId: UUID;
  private name: string;
  private description: string;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private version: number;

  /**
   * 创建CognitiveModel实例
   * @param params CognitiveModel参数
   */
  constructor(params: {
    id?: UUID;
    userId: UUID;
    name: string;
    description: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
  }) {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Cognitive model name cannot be empty');
    }

    this.id = params.id || UUID.generate();
    this.userId = params.userId;
    this.name = params.name;
    this.description = params.description;
    this.isActive = params.isActive !== undefined ? params.isActive : true;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.version = params.version || 1;
  }

  /**
   * 获取认知模型ID
   */
  getId(): UUID {
    return this.id;
  }

  /**
   * 获取用户ID
   */
  getUserId(): UUID {
    return this.userId;
  }

  /**
   * 获取认知模型名称
   */
  getName(): string {
    return this.name;
  }

  /**
   * 设置认知模型名称
   * @param name 新模型名称
   */
  setName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Cognitive model name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * 获取认知模型描述
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * 设置认知模型描述
   * @param description 新模型描述
   */
  setDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * 获取认知模型是否活跃
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * 激活认知模型
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * 停用认知模型
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * 获取认知模型创建时间
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * 获取认知模型更新时间
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * 获取认知模型版本
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * 增加认知模型版本号
   */
  private incrementVersion(): void {
    this.version += 1;
  }

  /**
   * 比较两个CognitiveModel是否相等
   * @param other 另一个CognitiveModel实例
   * @returns 是否相等
   */
  equals(other: CognitiveModel): boolean {
    return this.id.equals(other.getId());
  }
}
