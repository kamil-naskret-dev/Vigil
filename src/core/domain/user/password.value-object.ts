import * as bcrypt from 'bcrypt';
import { DomainError } from '../errors/domain.error';

const SALT_ROUNDS = 10;
const MIN_LENGTH = 8;

export class HashedPassword {
  private readonly _hash: string;

  private constructor(hash: string) {
    this._hash = hash;
  }

  static async hash(plaintext: string): Promise<HashedPassword> {
    if (!plaintext || plaintext.length < MIN_LENGTH) {
      throw new DomainError(
        `Password must be at least ${MIN_LENGTH} characters`,
      );
    }

    const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
    return new HashedPassword(hash);
  }

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  async compare(plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this._hash);
  }

  get value(): string {
    return this._hash;
  }
}
