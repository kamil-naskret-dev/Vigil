import { DomainError } from '../errors/domain.error';

export enum IntervalMinutes {
  ONE = 1,
  FIVE = 5,
  TEN = 10,
  THIRTY = 30,
  SIXTY = 60,
}

const VALID_INTERVALS = Object.values(IntervalMinutes).filter(
  (v) => typeof v === 'number',
) as number[];

export class CheckInterval {
  private readonly _minutes: IntervalMinutes;

  private constructor(minutes: IntervalMinutes) {
    this._minutes = minutes;
  }

  static create(minutes: number): CheckInterval {
    if (!VALID_INTERVALS.includes(minutes)) {
      throw new DomainError(
        `Invalid interval. Must be one of: ${VALID_INTERVALS.join(', ')} minutes`,
      );
    }

    return new CheckInterval(minutes as IntervalMinutes);
  }

  get minutes(): IntervalMinutes {
    return this._minutes;
  }

  toMilliseconds(): number {
    return this._minutes * 60 * 1000;
  }
}
