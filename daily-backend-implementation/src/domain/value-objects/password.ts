/**
 * Password值对象
 * 用于安全存储和验证密码
 */
import * as bcrypt from 'bcryptjs';

export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  /**
   * 创建Password实例
   * @param value 密码字符串
   * @param isHashed 是否已经过哈希处理，默认为false
   */
  constructor(value: string, isHashed: boolean = false) {
    if (!value || value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    this.isHashed = isHashed;
    this.value = isHashed ? value : this.hashPassword(value);
  }

  /**
   * 获取密码字符串值
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 验证密码是否匹配
   * @param plainPassword 明文密码
   * @returns 是否匹配
   */
  async validate(plainPassword: string): Promise<boolean> {
    if (this.isHashed) {
      // 使用bcrypt比较哈希值
      return bcrypt.compare(plainPassword, this.value);
    }
    // 未哈希的密码直接比较
    return plainPassword === this.value;
  }

  /**
   * 哈希密码
   * @param password 明文密码
   * @returns 哈希后的密码
   */
  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  /**
   * 比较两个Password是否相等
   * @param other 另一个Password实例
   * @returns 是否相等
   */
  equals(other: Password): boolean {
    return this.value === other.getValue();
  }

  /**
   * 检查密码是否符合复杂度要求
   * @param password 要检查的密码
   * @returns 是否符合复杂度要求
   */
  static isStrongPassword(password: string): boolean {
    // 至少8个字符，包含大小写字母、数字和特殊字符
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
}