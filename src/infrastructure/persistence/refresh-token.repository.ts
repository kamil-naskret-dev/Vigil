import { Injectable } from '@nestjs/common';
import {
  IRefreshTokenRepository,
  RefreshTokenData,
} from '../../core/application/ports/refresh-token.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    data: Omit<RefreshTokenData, 'id'>,
  ): Promise<RefreshTokenData> {
    return this.prisma.refreshToken.create({ data });
  }

  async findByToken(token: string): Promise<RefreshTokenData | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }
}
