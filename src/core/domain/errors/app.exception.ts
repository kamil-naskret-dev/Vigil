import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes.enum';

export class AppException extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.name = 'AppException';
  }

  static conflict(code: ErrorCode, message: string): AppException {
    return new AppException(code, message, HttpStatus.CONFLICT);
  }

  static unauthorized(code: ErrorCode, message: string): AppException {
    return new AppException(code, message, HttpStatus.UNAUTHORIZED);
  }

  static notFound(code: ErrorCode, message: string): AppException {
    return new AppException(code, message, HttpStatus.NOT_FOUND);
  }
}