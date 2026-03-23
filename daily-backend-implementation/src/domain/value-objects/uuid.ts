/**
 * UUID值对象
 * 用于生成和验证UUID
 */
export class UUID {
  /**
   * UUID值
   */
  private readonly _value: string;

  /**
   * 创建UUID实例
   * @param value UUID字符串
   * @throws Error 如果UUID格式无效
   */
  private constructor(value: string) {
    if (!UUID.isValid(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }
    this._value = value;
  }

  /**
   * 获取UUID值
   */
  get value(): string {
    return this._value;
  }

  /**
   * 生成新的UUID
   * @returns UUID实例
   */
  public static generate(): UUID {
    // 使用UUID v4格式
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return new UUID(uuid);
  }

  /**
   * 从字符串创建UUID实例
   * @param value UUID字符串
   * @returns UUID实例
   * @throws Error 如果UUID格式无效
   */
  public static fromString(value: string): UUID {
    return new UUID(value);
  }

  /**
   * 验证UUID格式是否有效
   * @param value 要验证的字符串
   * @returns 如果格式有效返回true，否则返回false
   */
  public static isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * 比较两个UUID是否相等
   * @param other 另一个UUID实例
   * @returns 如果相等返回true，否则返回false
   */
  public equals(other: UUID): boolean {
    return this._value === other._value;
  }

  /**
   * 将UUID转换为字符串
   * @returns UUID字符串
   */
  public toString(): string {
    return this._value;
  }
}