import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../../infrastructure/persistence/user.repository';
import { RegisterUserHandler } from '../../core/application/commands/register-user.handler';
import { AuthController } from '../http/auth/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    {
      provide: RegisterUserHandler,
      useFactory: (repo: PrismaUserRepository) => new RegisterUserHandler(repo),
      inject: [PrismaUserRepository],
    },
  ],
})
export class AuthModule {}