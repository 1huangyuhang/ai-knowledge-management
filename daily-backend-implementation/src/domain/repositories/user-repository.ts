/**
 * 用户仓库接口
 * 定义用户数据的访问方式
 */
import { User } from '../entities/user';

export interface UserRepository {
  /**
   * 创建用户
   * @param user 用户实体
   * @returns 创建的用户实体
   */
  create(user: User): Promise<User>;

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户实体，如果不存在则返回null
   */
  getById(id: string): Promise<User | null>;

  /**
   * 根据邮箱获取用户
   * @param email 用户邮箱
   * @returns 用户实体，如果不存在则返回null
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * 更新用户
   * @param user 用户实体
   * @returns 更新后的用户实体
   */
  update(user: User): Promise<User>;

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 获取所有用户
   * @returns 用户实体列表
   */
  getAll(): Promise<User[]>;

  /**
   * 检查用户是否存在
   * @param email 用户邮箱
   * @returns 是否存在
   */
  existsByEmail(email: string): Promise<boolean>;
}
