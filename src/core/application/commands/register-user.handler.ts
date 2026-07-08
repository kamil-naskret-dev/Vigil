import { ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../ports/user.repository.port';
import { HashedPassword } from '../../domain/user/password.value-object';
import { User } from '../../domain/user/user.entity';
import { RegisterUserCommand } from './register-user.command';

export class RegisterUserHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const password = await HashedPassword.hash(command.password);
    const user = User.create({
      id: randomUUID(),
      email: command.email,
      password,
    });

    await this.userRepository.save(user);
  }
}
