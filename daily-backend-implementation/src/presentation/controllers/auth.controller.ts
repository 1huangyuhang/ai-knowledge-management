/**
 * 认证控制器
 * 处理用户注册、登录和令牌刷新等认证相关的API请求
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';

/**
 * 认证控制器类
 */
export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;

  /**
   * 构造函数，通过依赖注入获取服务实例
   */
  constructor() {
    this.registerUseCase = container.resolve('RegisterUseCase');
    this.loginUseCase = container.resolve('LoginUseCase');
    this.refreshTokenUseCase = container.resolve('RefreshTokenUseCase');
  }

  /**
   * 用户注册
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 解析请求体，支持多种注册方式
      const requestBody = request.body as any;
      const { email, password, username, phone } = requestBody;
      
      // 确保email字段有值，无论用户使用哪种注册方式
      // 如果email为空但提供了phone，则将phone作为email使用
      // 这是一个临时解决方案，后续可以优化为支持手机号注册
      const registerEmail = email || phone || '';
      
      // 调用注册用例
      const result = await this.registerUseCase.execute({
        email: registerEmail,
        password,
        firstName: username,
        lastName: ''
      });
      
      // 返回前端期望的响应格式
      return reply.send({
        access_token: result.token,
        refresh_token: result.token, // 暂时使用相同的token作为refresh_token
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(400).send({
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  /**
   * 用户登录
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as any;
      
      // 调用登录用例
      const result = await this.loginUseCase.execute({
        email,
        password
      });
      
      // 返回前端期望的响应格式
      return reply.send({
        access_token: result.token,
        refresh_token: result.token, // 暂时使用相同的token作为refresh_token
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    } catch (error) {
      return reply.status(401).send({
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  /**
   * 刷新令牌
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body as any;
      
      // 调用刷新令牌用例
      const result = await this.refreshTokenUseCase.execute({
        refreshToken
      });
      
      // 返回前端期望的响应格式
      return reply.send({
        access_token: result.token,
        refresh_token: result.refreshToken
      });
    } catch (error) {
      return reply.status(401).send({
        error: error instanceof Error ? error.message : 'Failed to refresh token'
      });
    }
  }
}
