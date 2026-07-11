import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../core/application/auth/ports/user.repository.port';
import { User } from '../../core/domain/user/user.entity';
import { HashedPassword } from '../../core/domain/user/password.value-object';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!record) return null;

    return User.create({
      id: record.id,
      email: record.email,
      password: HashedPassword.fromHash(record.passwordHash),
      createdAt: record.createdAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });

    if (!record) return null;

    return User.create({
      id: record.id,
      email: record.email,
      password: HashedPassword.fromHash(record.passwordHash),
      createdAt: record.createdAt,
    });
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.password.value,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.password.value,
      },
    });
  }
}