/**
 * 注册用例
 * 处理用户注册业务逻辑
 */
import { User, UserImpl, UserRole } from '../../../domain/entities/user';
import { UUID } from '../../../domain/value-objects/uuid';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { AuthError } from '../../../domain/errors/domain-error';

/**
 * 注册用例输入参数
 */
export interface RegisterUseCaseInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * 注册用例输出结果
 */
export interface RegisterUseCaseOutput {
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
 * 注册用例
 */
export class RegisterUseCase {
  private readonly userRepository: UserRepository;

  /**
   * 创建RegisterUseCase实例
   * @param userRepository 用户仓库
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * 执行注册用例
   * @param input 注册输入参数
   * @returns 注册结果
   */
  async execute(input: RegisterUseCaseInput): Promise<RegisterUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.email || !input.password || !input.firstName) {
      throw new AuthError('All fields are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为值对象
    const email = new Email(input.email);
    const password = new Password(input.password, true);

    // 3. 检查用户是否已存在
    const existingUser = await this.userRepository.getByEmail(email.value);
    if (existingUser) {
      throw new AuthError(`Email ${input.email} already exists`, 'EMAIL_ALREADY_EXISTS');
    }

    // 4. 生成唯一ID
    const id = UUID.generate().value;

    // 5. 创建用户名（使用firstName和lastName组合）
    const username = `${input.firstName} ${input.lastName}`.trim();

    // 6. 创建用户实体
    const user = new UserImpl(
      id,
      username,
      email.value,
      password.value,
      UserRole.USER
    );

    // 7. 保存用户到仓库
    const createdUser = await this.userRepository.create(user);

    // 8. 生成JWT令牌（模拟实现，实际将在后续模块中实现）
    const token = 'mock-jwt-token-' + Date.now();

    // 9. 构造输出结果
    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        username: createdUser.username,
        fullName: createdUser.username
      },
      token
    };
  }
}
