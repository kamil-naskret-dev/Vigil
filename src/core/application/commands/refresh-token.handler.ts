import { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';
import { RefreshTokenCommand } from './refresh-token.command';
import { IJwtService } from './login-user.handler';
import { AppException } from '../../domain/errors/app.exception';
import { ErrorCode } from '../../domain/errors/error-codes.enum';

export interface RefreshResult {
  accessToken: string;
}

export class RefreshTokenHandler {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshResult> {
    const stored = await this.refreshTokenRepository.findByToken(
      command.refreshToken,
    );

    if (!stored) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Invalid refresh token',
      );
    }

    if (stored.revokedAt) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Refresh token has been revoked',
      );
    }

    if (stored.expiresAt < new Date()) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Refresh token has expired',
      );
    }

    const accessToken = this.jwtService.sign({ sub: stored.userId, email: '' });

    return { accessToken };
  }
}
