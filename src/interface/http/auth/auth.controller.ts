import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { RegisterUserHandler } from '../../../core/application/auth/commands/register-user.handler';
import { RegisterUserCommand } from '../../../core/application/auth/commands/register-user.command';
import {
  LoginUserHandler,
  LoginResult,
} from '../../../core/application/auth/commands/login-user.handler';
import { LoginUserCommand } from '../../../core/application/auth/commands/login-user.command';
import {
  RefreshTokenHandler,
  RefreshResult,
} from '../../../core/application/auth/commands/refresh-token.handler';
import { RefreshTokenCommand } from '../../../core/application/auth/commands/refresh-token.command';
import { RevokeTokenHandler } from '../../../core/application/auth/commands/revoke-token.handler';
import { RevokeTokenCommand } from '../../../core/application/auth/commands/revoke-token.command';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ApiValidationResponse,
  ApiConflictResponse,
  ApiRateLimitResponse,
} from '../../../infrastructure/swagger/swagger-responses';

@ApiTags('Auth')
@Controller('auth')
@Throttle({ default: { ttl: 60000, limit: 10 } })
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginUserHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly revokeTokenHandler: RevokeTokenHandler,
  ) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account. Email must be unique.',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: { example: { message: 'User registered successfully' } },
  })
  @ApiValidationResponse()
  @ApiConflictResponse('Email already in use')
  @ApiRateLimitResponse()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    await this.registerHandler.execute(
      new RegisterUserCommand(dto.email, dto.password),
    );

    return { message: 'User registered successfully' };
  }

  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates user and returns a short-lived access token (1d in dev, 15m in prod) and a long-lived refresh token (7d).',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiValidationResponse()
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiRateLimitResponse()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.loginHandler.execute(
      new LoginUserCommand(dto.email, dto.password),
    );
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Exchanges a valid refresh token for a new access token and refresh token pair. Old refresh token is revoked.',
  })
  @ApiOkResponse({
    description: 'New token pair issued',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiValidationResponse()
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid, expired or already revoked',
  })
  @ApiRateLimitResponse()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshResult> {
    return this.refreshTokenHandler.execute(
      new RefreshTokenCommand(dto.refreshToken),
    );
  }

  @ApiOperation({
    summary: 'Logout',
    description:
      'Revokes the provided refresh token. Access token remains valid until it expires naturally.',
  })
  @ApiNoContentResponse({ description: 'Logged out successfully' })
  @ApiValidationResponse()
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid or already revoked',
  })
  @ApiRateLimitResponse()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.revokeTokenHandler.execute(
      new RevokeTokenCommand(dto.refreshToken),
    );
  }
}
