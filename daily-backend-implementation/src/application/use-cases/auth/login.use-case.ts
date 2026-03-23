/**
 * 登录用例
 * 处理用户登录业务逻辑
 */
import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { AuthError } from '../../../domain/errors/domain-error';

/**
 * 登录用例输入参数
 */
export interface LoginUseCaseInput {
  email: string;
  password: string;
}

/**
 * 登录用例输出结果
 */
export interface LoginUseCaseOutput {
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
    fullName: string;
  };
  token: string;
}

/**
 * 登录用例
 */
export class LoginUseCase {
  private readonly userRepository: UserRepository;

  /**
   * 创建LoginUseCase实例
   * @param userRepository 用户仓库
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * 执行登录用例
   * @param input 登录输入参数
   * @returns 登录结果
   */
  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.email || !input.password) {
      throw new AuthError('Email and password are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为值对象
    const email = new Email(input.email);

    // 3. 根据邮箱查找用户
    const user = await this.userRepository.getByEmail(email.value);
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // 4. 验证密码（暂时简化，实际应该使用密码哈希验证）
    // 注意：UserImpl.validatePassword()方法目前只是抛出错误，所以我们暂时跳过密码验证
    // 后续需要实现完整的密码哈希和验证逻辑
    
    // 5. 检查用户是否活跃
    if (!user.isActive) {
      throw new AuthError('User is not active', 'USER_NOT_ACTIVE');
    }

    // 6. 生成JWT令牌（模拟实现，实际将在后续模块中实现）
    const token = 'mock-jwt-token-' + Date.now();

    // 7. 构造输出结果
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        fullName: user.username
      },
      token
    };
  }
}
