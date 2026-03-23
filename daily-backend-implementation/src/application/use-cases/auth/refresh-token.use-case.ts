/**
 * 刷新Token用例
 * 处理用户刷新认证Token的业务逻辑
 */
import { UUID } from '../../../domain/value-objects/uuid';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { AuthError } from '../../../domain/errors/domain-error';

/**
 * 刷新Token用例输入参数
 */
export interface RefreshTokenUseCaseInput {
  userId: string;
  refreshToken: string;
}

/**
 * 刷新Token用例输出结果
 */
export interface RefreshTokenUseCaseOutput {
  token: string;
  refreshToken: string;
}

/**
 * 刷新Token用例
 */
export class RefreshTokenUseCase {
  private readonly userRepository: UserRepository;

  /**
   * 创建RefreshTokenUseCase实例
   * @param userRepository 用户仓库
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * 执行刷新Token用例
   * @param input 刷新Token输入参数
   * @returns 刷新Token结果
   */
  async execute(input: RefreshTokenUseCaseInput): Promise<RefreshTokenUseCaseOutput> {
    // 1. 验证输入参数
    if (!input.userId || !input.refreshToken) {
      throw new AuthError('User ID and refresh token are required', 'INVALID_INPUT');
    }

    // 2. 将输入参数转换为领域对象
    const userId = UUID.fromString(input.userId);

    // 3. 根据ID查找用户
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw AuthError.userNotFoundById(input.userId);
    }

    // 4. 检查用户是否活跃
    if (!user.getIsActive()) {
      throw AuthError.userNotActive();
    }

    // 5. 验证刷新Token（模拟实现，实际将在后续模块中实现）
    // 这里应该验证refreshToken的有效性，包括过期时间、签名等
    const isValidRefreshToken = true; // 模拟实现

    if (!isValidRefreshToken) {
      throw AuthError.invalidRefreshToken();
    }

    // 6. 生成新的JWT令牌和刷新令牌
    const token = 'new-jwt-token-' + Date.now();
    const newRefreshToken = 'new-refresh-token-' + Date.now();

    // 7. 构造输出结果
    return {
      token,
      refreshToken: newRefreshToken
    };
  }
}
