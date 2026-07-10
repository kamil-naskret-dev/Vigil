import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from '../../core/domain/errors/app.exception';
import { ErrorCode } from '../../core/domain/errors/error-codes.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw AppException.unauthorized(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Unauthorized',
      );
    }

    return user;
  }
}