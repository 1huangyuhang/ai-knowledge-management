/**
 * 思想片段实体
 * 代表用户的一个思想片段，是系统的核心输入
 */
export interface ThoughtFragment {
  /**
   * 思想片段唯一标识符
   */
  readonly id: string;

  /**
   * 思想片段的内容
   */
  content: string;

  /**
   * 思想片段的元数据
   */
  metadata: Record<string, any>;

  /**
   * 思想片段所属用户ID
   */
  readonly userId: string;

  /**
   * 思想片段的创建时间
   */
  readonly createdAt: Date;

  /**
   * 思想片段的更新时间
   */
  updatedAt: Date;

  /**
   * 思想片段是否已处理
   */
  isProcessed: boolean;

  /**
   * 处理失败次数
   */
  processingAttempts: number;

  /**
   * 最后处理时间
   */
  lastProcessedAt: Date | null;

  /**
   * 更新思想片段内容
   * @param content 新的思想片段内容
   */
  updateContent(content: string): void;

  /**
   * 更新思想片段元数据
   * @param metadata 要更新的元数据
   */
  updateMetadata(metadata: Record<string, any>): void;

  /**
   * 标记思想片段为已处理
   */
  markAsProcessed(): void;

  /**
   * 标记思想片段为未处理
   */
  markAsUnprocessed(): void;

  /**
   * 增加处理失败次数
   */
  incrementProcessingAttempts(): void;
}

/**
 * ThoughtFragment实体的具体实现
 */
export class ThoughtFragmentImpl implements ThoughtFragment {
  /**
   * 思想片段唯一标识符
   */
  public readonly id: string;

  /**
   * 思想片段的内容
   */
  public content: string;

  /**
   * 思想片段的元数据
   */
  public metadata: Record<string, any>;

  /**
   * 思想片段所属用户ID
   */
  public readonly userId: string;

  /**
   * 思想片段的创建时间
   */
  public readonly createdAt: Date;

  /**
   * 思想片段的更新时间
   */
  public updatedAt: Date;

  /**
   * 思想片段是否已处理
   */
  public isProcessed: boolean;

  /**
   * 处理失败次数
   */
  public processingAttempts: number;

  /**
   * 最后处理时间
   */
  public lastProcessedAt: Date | null;

  /**
   * 创建思想片段实例
   * @param id 思想片段ID
   * @param content 思想片段内容
   * @param userId 所属用户ID
   * @param metadata 元数据
   * @param isProcessed 是否已处理
   * @param processingAttempts 处理失败次数
   * @param lastProcessedAt 最后处理时间
   * @param createdAt 创建时间
   */
  constructor(
    id: string,
    content: string,
    userId: string,
    metadata: Record<string, any> = {},
    isProcessed: boolean = false,
    processingAttempts: number = 0,
    lastProcessedAt: Date | null = null,
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
    this.isProcessed = isProcessed;
    this.processingAttempts = processingAttempts;
    this.lastProcessedAt = lastProcessedAt;
  }

  /**
   * 更新思想片段内容
   * @param content 新的思想片段内容
   */
  public updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }

  /**
   * 更新思想片段元数据
   * @param metadata 要更新的元数据
   */
  public updateMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
  }

  /**
   * 标记思想片段为已处理
   */
  public markAsProcessed(): void {
    this.isProcessed = true;
    this.lastProcessedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * 标记思想片段为未处理
   */
  public markAsUnprocessed(): void {
    this.isProcessed = false;
    this.updatedAt = new Date();
  }

  /**
   * 增加处理失败次数
   */
  public incrementProcessingAttempts(): void {
    this.processingAttempts += 1;
    this.updatedAt = new Date();
  }
}
