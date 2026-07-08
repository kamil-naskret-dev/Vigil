import { HashedPassword } from './password.value-object';

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: HashedPassword,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: string;
    password: HashedPassword;
    createdAt?: Date;
  }): User {
    return new User(
      params.id,
      params.email.toLowerCase().trim(),
      params.password,
      params.createdAt ?? new Date(),
    );
  }
}
