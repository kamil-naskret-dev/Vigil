import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserHandler } from '../../../core/application/auth/commands/register-user.handler';
import { RegisterUserCommand } from '../../../core/application/auth/commands/register-user.command';
import { LoginUserHandler, LoginResult } from '../../../core/application/auth/commands/login-user.handler';
import { LoginUserCommand } from '../../../core/application/auth/commands/login-user.command';
import { RefreshTokenHandler, RefreshResult } from '../../../core/application/auth/commands/refresh-token.handler';
import { RefreshTokenCommand } from '../../../core/application/auth/commands/refresh-token.command';
import { RevokeTokenHandler } from '../../../core/application/auth/commands/revoke-token.handler';
import { RevokeTokenCommand } from '../../../core/application/auth/commands/revoke-token.command';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginUserHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly revokeTokenHandler: RevokeTokenHandler,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    await this.registerHandler.execute(
      new RegisterUserCommand(dto.email, dto.password),
    );

    return { message: 'User registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.loginHandler.execute(
      new LoginUserCommand(dto.email, dto.password),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshResult> {
    return this.refreshTokenHandler.execute(
      new RefreshTokenCommand(dto.refreshToken),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.revokeTokenHandler.execute(
      new RevokeTokenCommand(dto.refreshToken),
    );
  }
}
