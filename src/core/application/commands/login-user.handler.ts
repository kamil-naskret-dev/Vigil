import { IUserRepository } from '../ports/user.repository.port';
import { LoginUserCommand } from './login-user.command';
import { AppException } from '../../domain/errors/app.exception';
import { ErrorCode } from '../../domain/errors/error-codes.enum';

export interface LoginResult {
  accessToken: string;
}

export interface IJwtService {
  sign(payload: { sub: string; email: string }): string;
}

export class LoginUserHandler {
  constructor(
    private readonly userRepository: IUserRepository,
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

    return { accessToken };
  }
}
