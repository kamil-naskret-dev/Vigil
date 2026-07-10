import { DomainError } from '../errors/domain.error';

export class MonitorUrl {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): MonitorUrl {
    if (!value || value.trim().length === 0) {
      throw new DomainError('URL cannot be empty');
    }

    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new DomainError(`Invalid URL format: ${value}`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new DomainError('URL must use http or https protocol');
    }

    return new MonitorUrl(value);
  }

  get value(): string {
    return this._value;
  }
}