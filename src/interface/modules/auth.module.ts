import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { PrismaUserRepository } from '../../infrastructure/persistence/user.repository';
import { RegisterUserHandler } from '../../core/application/commands/register-user.handler';
import { LoginUserHandler } from '../../core/application/commands/login-user.handler';
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
        signOptions: { expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    JwtStrategy,
    {
      provide: RegisterUserHandler,
      useFactory: (repo: PrismaUserRepository) => new RegisterUserHandler(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: LoginUserHandler,
      useFactory: (repo: PrismaUserRepository, jwtService: JwtService) =>
        new LoginUserHandler(repo, jwtService),
      inject: [PrismaUserRepository, JwtService],
    },
  ],
})
export class AuthModule {}