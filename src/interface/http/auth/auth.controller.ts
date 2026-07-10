import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserHandler } from '../../../core/application/commands/register-user.handler';
import { RegisterUserCommand } from '../../../core/application/commands/register-user.command';
import { LoginUserHandler, LoginResult } from '../../../core/application/commands/login-user.handler';
import { LoginUserCommand } from '../../../core/application/commands/login-user.command';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginUserHandler,
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
}
