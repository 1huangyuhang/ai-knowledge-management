/**
 * 用户仓库实现
 * 使用TypeORM实现UserRepository接口
 */
import { Repository } from 'typeorm';
import { User, UserImpl, UserRole } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { UserEntity } from '../entities/user.entity';

/**
 * 用户仓库实现类
 */
export class UserRepositoryImpl implements UserRepository {
  /**
   * 构造函数
   * @param userEntityRepository TypeORM的UserEntity仓库
   */
  constructor(
    private readonly userEntityRepository: Repository<UserEntity>
  ) {}

  /**
   * 将领域实体转换为数据库实体
   * @param user 领域实体
   * @returns 数据库实体
   */
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.password = user.passwordHash;
    entity.role = user.role;
    entity.firstName = user.username.split(' ')[0] || 'User';
    entity.lastName = user.username.split(' ')[1] || '';
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }

  /**
   * 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  private toDomain(entity: UserEntity): User {
    return new UserImpl(
      entity.id,
      `${entity.firstName} ${entity.lastName}`.trim() || 'User',
      entity.email,
      entity.password,
      entity.role as UserRole,
      entity.createdAt
    );
  }

  /**
   * 创建用户
   * @param user 用户实体
   * @returns 创建的用户实体
   */
  async create(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.userEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户实体，如果不存在则返回null
   */
  async getById(id: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 根据邮箱获取用户
   * @param email 用户邮箱
   * @returns 用户实体，如果不存在则返回null
   */
  async getByEmail(email: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOneBy({ email });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * 更新用户
   * @param user 用户实体
   * @returns 更新后的用户实体
   */
  async update(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.userEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userEntityRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * 获取所有用户
   * @returns 用户实体列表
   */
  async getAll(): Promise<User[]> {
    const entities = await this.userEntityRepository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * 检查用户是否存在
   * @param email 用户邮箱
   * @returns 是否存在
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userEntityRepository.countBy({ email });
    return count > 0;
  }
}
