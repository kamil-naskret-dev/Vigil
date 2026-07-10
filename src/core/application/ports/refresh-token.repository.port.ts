export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface IRefreshTokenRepository {
  save(data: Omit<RefreshTokenData, 'id'>): Promise<RefreshTokenData>;
  findByToken(token: string): Promise<RefreshTokenData | null>;
  revoke(token: string): Promise<void>;
}
