import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserHandler } from '../../../core/application/commands/register-user.handler';
import { RegisterUserCommand } from '../../../core/application/commands/register-user.command';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerHandler: RegisterUserHandler) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    await this.registerHandler.execute(
      new RegisterUserCommand(dto.email, dto.password),
    );

    return { message: 'User registered successfully' };
  }
}
