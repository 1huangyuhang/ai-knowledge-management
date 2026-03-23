/**
 * 用户实体
 * 代表系统中的用户，包含基本信息和认证相关逻辑
 */
export interface User {
  /**
   * 用户唯一标识符
   */
  readonly id: string;

  /**
   * 用户名
   */
  username: string;

  /**
   * 用户邮箱
   */
  email: string;

  /**
   * 密码哈希
   */
  passwordHash: string;

  /**
   * 用户角色
   */
  role: UserRole;

  /**
   * 用户创建时间
   */
  readonly createdAt: Date;

  /**
   * 用户更新时间
   */
  updatedAt: Date;

  /**
   * 用户是否激活
   */
  isActive: boolean;

  /**
   * 验证密码
   * @param password 要验证的密码
   * @returns 如果密码正确返回true，否则返回false
   */
  validatePassword(password: string): Promise<boolean>;

  /**
   * 更新用户信息
   * @param updates 要更新的用户信息
   */
  update(updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): void;

  /**
   * 激活用户
   */
  activate(): void;

  /**
   * 禁用用户
   */
  deactivate(): void;
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User实体的具体实现
 */
export class UserImpl implements User {
  /**
   * 用户唯一标识符
   */
  public readonly id: string;

  /**
   * 用户名
   */
  public username: string;

  /**
   * 用户邮箱
   */
  public email: string;

  /**
   * 密码哈希
   */
  public passwordHash: string;

  /**
   * 用户角色
   */
  public role: UserRole;

  /**
   * 用户创建时间
   */
  public readonly createdAt: Date;

  /**
   * 用户更新时间
   */
  public updatedAt: Date;

  /**
   * 用户是否激活
   */
  public isActive: boolean;

  /**
   * 创建用户实例
   * @param id 用户ID
   * @param username 用户名
   * @param email 用户邮箱
   * @param passwordHash 密码哈希
   * @param role 用户角色，默认为USER
   * @param createdAt 创建时间，默认为当前时间
   */
  constructor(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.USER,
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
    this.isActive = true;
  }

  /**
   * 验证密码
   * @param password 要验证的密码
   * @returns 如果密码正确返回true，否则返回false
   */
  public async validatePassword(password: string): Promise<boolean> {
    // 这里使用bcrypt进行密码验证，实际实现中会从基础设施层注入
    // 为了保持Domain层的纯净，这里只定义接口，具体实现将在后续添加
    throw new Error('validatePassword method not implemented yet');
  }

  /**
   * 更新用户信息
   * @param updates 要更新的用户信息
   */
  public update(updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): void {
    if (updates.username) {
      this.username = updates.username;
    }
    if (updates.email) {
      this.email = updates.email;
    }
    if (updates.role) {
      this.role = updates.role;
    }
    if (updates.isActive !== undefined) {
      this.isActive = updates.isActive;
    }
    this.updatedAt = new Date();
  }

  /**
   * 激活用户
   */
  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * 禁用用户
   */
  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
