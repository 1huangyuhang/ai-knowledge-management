/**
 * Email值对象
 * 用于验证和存储邮箱地址
 */
export class Email {
  private readonly value: string;

  /**
   * 创建Email实例
   * @param value 邮箱地址字符串
   */
  constructor(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }
    this.value = value.toLowerCase();
  }

  /**
   * 获取邮箱字符串值
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 验证邮箱格式
   * @param email 要验证的邮箱字符串
   * @returns 是否为有效的邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * 比较两个Email是否相等
   * @param other 另一个Email实例
   * @returns 是否相等
   */
  equals(other: Email): boolean {
    return this.value === other.getValue();
  }

  /**
   * 获取邮箱的用户名部分
   * @returns 邮箱用户名
   */
  getUsername(): string {
    const parts = this.value.split('@');
    return parts[0] || '';
  }

  /**
   * 获取邮箱的域名部分
   * @returns 邮箱域名
   */
  getDomain(): string {
    const parts = this.value.split('@');
    return parts[1] || '';
  }
}