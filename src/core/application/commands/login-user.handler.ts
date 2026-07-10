import { randomUUID } from 'crypto';
import { IUserRepository } from '../ports/user.repository.port';
import { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';
import { LoginUserCommand } from './login-user.command';
import { AppException } from '../../domain/errors/app.exception';
import { ErrorCode } from '../../domain/errors/error-codes.enum';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtService {
  sign(payload: { sub: string; email: string }): string;
}

const REFRESH_TOKEN_TTL_DAYS = 7;

export class LoginUserHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const isValid = await user.password.compare(command.password);
    if (!isValid) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const { token: refreshToken } = await this.refreshTokenRepository.save({
      token: randomUUID(),
      userId: user.id,
      expiresAt,
      revokedAt: null,
    });

    return { accessToken, refreshToken };
  }
}
