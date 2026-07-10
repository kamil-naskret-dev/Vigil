import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { PrismaUserRepository } from '../../infrastructure/persistence/user.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/persistence/refresh-token.repository';
import { RegisterUserHandler } from '../../core/application/commands/register-user.handler';
import { LoginUserHandler } from '../../core/application/commands/login-user.handler';
import { RefreshTokenHandler } from '../../core/application/commands/refresh-token.handler';
import { RevokeTokenHandler } from '../../core/application/commands/revoke-token.handler';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { AuthController } from '../http/auth/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
    JwtStrategy,
    {
      provide: RegisterUserHandler,
      useFactory: (repo: PrismaUserRepository) => new RegisterUserHandler(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: LoginUserHandler,
      useFactory: (
        userRepo: PrismaUserRepository,
        refreshRepo: PrismaRefreshTokenRepository,
        jwtService: JwtService,
      ) => new LoginUserHandler(userRepo, refreshRepo, jwtService),
      inject: [PrismaUserRepository, PrismaRefreshTokenRepository, JwtService],
    },
    {
      provide: RefreshTokenHandler,
      useFactory: (
        refreshRepo: PrismaRefreshTokenRepository,
        jwtService: JwtService,
      ) => new RefreshTokenHandler(refreshRepo, jwtService),
      inject: [PrismaRefreshTokenRepository, JwtService],
    },
    {
      provide: RevokeTokenHandler,
      useFactory: (refreshRepo: PrismaRefreshTokenRepository) =>
        new RevokeTokenHandler(refreshRepo),
      inject: [PrismaRefreshTokenRepository],
    },
  ],
})
export class AuthModule {}
