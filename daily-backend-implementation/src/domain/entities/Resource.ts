//
// Resource.ts
//

// 暂时移除对不存在的核心Entity和UUID模块的依赖
// 这些依赖应该来自项目的核心Domain层，但目前尚未实现

/**
 * 简单的UUID生成器，用于临时替代核心Domain的UUID模块
 */
class UUID {
  private _value: string;
  
  private constructor(value: string) {
    this._value = value;
  }
  
  get value(): string {
    return this._value;
  }
  
  static create(): UUID {
    return new UUID(crypto.randomUUID());
  }
  
  static fromString(value: string): UUID {
    return new UUID(value);
  }
}

/**
 * 简单的Entity基类，用于临时替代核心Domain的Entity模块
 */
abstract class Entity {
  constructor(protected _id: UUID) {
  }
  
  get id(): UUID {
    return this._id;
  }
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  /** LLM 资源 */
  LLM = 'LLM',
  /** Embedding 资源 */
  EMBEDDING = 'EMBEDDING',
  /** 向量数据库资源 */
  VECTOR_DB = 'VECTOR_DB',
  /** 文件处理资源 */
  FILE_PROCESSING = 'FILE_PROCESSING',
  /** 语音处理资源 */
  SPEECH_PROCESSING = 'SPEECH_PROCESSING',
  /** 认知建模资源 */
  COGNITIVE_MODELING = 'COGNITIVE_MODELING',
}

/**
 * 资源状态枚举
 */
export enum ResourceStatus {
  /** 可用 */
  AVAILABLE = 'AVAILABLE',
  /** 正在使用 */
  IN_USE = 'IN_USE',
  /** 维护中 */
  MAINTENANCE = 'MAINTENANCE',
  /** 不可用 */
  UNAVAILABLE = 'UNAVAILABLE',
}

/**
 * 资源实体
 */
export class Resource extends Entity {
  /** 资源名称 */
  private _name: string;
  /** 资源类型 */
  private _type: ResourceType;
  /** 资源描述 */
  private _description: string;
  /** 资源状态 */
  private _status: ResourceStatus;
  /** 资源容量 */
  private _capacity: number;
  /** 已使用容量 */
  private _usedCapacity: number;
  /** 资源配置 */
  private _config: Record<string, any>;
  /** 资源元数据 */
  private _metadata: Record<string, any>;
  /** 创建时间 */
  private _createdAt: Date;
  /** 更新时间 */
  private _updatedAt: Date;

  /**
   * 构造函数
   * @param id 资源ID
   * @param name 资源名称
   * @param type 资源类型
   * @param description 资源描述
   * @param status 资源状态
   * @param capacity 资源容量
   * @param usedCapacity 已使用容量
   * @param config 资源配置
   * @param metadata 资源元数据
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   */
  private constructor(
    id: UUID,
    name: string,
    type: ResourceType,
    description: string,
    status: ResourceStatus,
    capacity: number,
    usedCapacity: number,
    config: Record<string, any>,
    metadata: Record<string, any>,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id);
    this._name = name;
    this._type = type;
    this._description = description;
    this._status = status;
    this._capacity = capacity;
    this._usedCapacity = usedCapacity;
    this._config = config;
    this._metadata = metadata;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * 创建资源
   * @param name 资源名称
   * @param type 资源类型
   * @param description 资源描述
   * @param status 资源状态
   * @param capacity 资源容量
   * @param config 资源配置
   * @param metadata 资源元数据
   * @returns 资源实例
   */
  static create(
    name: string,
    type: ResourceType,
    description: string,
    status: ResourceStatus,
    capacity: number,
    config: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Resource {
    const id = UUID.create();
    const now = new Date();
    
    return new Resource(
      id,
      name,
      type,
      description,
      status,
      capacity,
      0,
      config,
      metadata,
      now,
      now
    );
  }

  /**
   * 更新资源
   * @param name 资源名称
   * @param description 资源描述
   * @param status 资源状态
   * @param capacity 资源容量
   * @param config 资源配置
   * @param metadata 资源元数据
   */
  update(
    name?: string,
    description?: string,
    status?: ResourceStatus,
    capacity?: number,
    config?: Record<string, any>,
    metadata?: Record<string, any>
  ): void {
    if (name !== undefined) {
      this._name = name;
    }
    if (description !== undefined) {
      this._description = description;
    }
    if (status !== undefined) {
      this._status = status;
    }
    if (capacity !== undefined) {
      this._capacity = capacity;
    }
    if (config !== undefined) {
      this._config = config;
    }
    if (metadata !== undefined) {
      this._metadata = metadata;
    }
    this._updatedAt = new Date();
  }

  /**
   * 占用资源
   * @param amount 占用量
   * @returns 是否成功占用
   */
  allocate(amount: number): boolean {
    if (this._status !== ResourceStatus.AVAILABLE) {
      return false;
    }
    
    if (this._usedCapacity + amount > this._capacity) {
      return false;
    }
    
    this._usedCapacity += amount;
    if (this._usedCapacity === this._capacity) {
      this._status = ResourceStatus.IN_USE;
    }
    this._updatedAt = new Date();
    return true;
  }

  /**
   * 释放资源
   * @param amount 释放量
   */
  release(amount: number): void {
    this._usedCapacity = Math.max(0, this._usedCapacity - amount);
    if (this._usedCapacity < this._capacity && this._status === ResourceStatus.IN_USE) {
      this._status = ResourceStatus.AVAILABLE;
    }
    this._updatedAt = new Date();
  }

  /**
   * 重置资源
   */
  reset(): void {
    this._usedCapacity = 0;
    this._status = ResourceStatus.AVAILABLE;
    this._updatedAt = new Date();
  }

  /**
   * 获取资源使用率
   * @returns 资源使用率 (0-1)
   */
  get usageRate(): number {
    return this._capacity > 0 ? this._usedCapacity / this._capacity : 0;
  }

  /**
   * 获取剩余容量
   * @returns 剩余容量
   */
  get remainingCapacity(): number {
    return this._capacity - this._usedCapacity;
  }

  /**
   * 资源名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 资源类型
   */
  get type(): ResourceType {
    return this._type;
  }

  /**
   * 资源描述
   */
  get description(): string {
    return this._description;
  }

  /**
   * 资源状态
   */
  get status(): ResourceStatus {
    return this._status;
  }

  /**
   * 资源容量
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * 已使用容量
   */
  get usedCapacity(): number {
    return this._usedCapacity;
  }

  /**
   * 资源配置
   */
  get config(): Record<string, any> {
    return { ...this._config };
  }

  /**
   * 资源元数据
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
