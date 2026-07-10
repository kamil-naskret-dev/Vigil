import { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';
import { RevokeTokenCommand } from './revoke-token.command';
import { AppException } from '../../domain/errors/app.exception';
import { ErrorCode } from '../../domain/errors/error-codes.enum';

export class RevokeTokenHandler {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: RevokeTokenCommand): Promise<void> {
    const stored = await this.refreshTokenRepository.findByToken(
      command.refreshToken,
    );

    if (!stored) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Invalid refresh token',
      );
    }

    await this.refreshTokenRepository.revoke(command.refreshToken);
  }
}
