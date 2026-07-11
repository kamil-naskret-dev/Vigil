import { MonitorUrl } from './monitor-url.value-object';
import { CheckInterval } from './check-interval.value-object';
import { MonitorStatus } from './monitor-status.value-object';
import { DomainError } from '../errors/domain.error';
import { DomainEvent } from '../events/domain-event.base';
import {
  MonitorCreated,
  MonitorDegraded,
  MonitorPaused,
  MonitorRecovered,
  MonitorResumed,
} from './monitor.events';

const DEGRADED_THRESHOLD = 3;

export class Monitor {
  private readonly _events: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly url: MonitorUrl,
    public readonly interval: CheckInterval,
    private _status: MonitorStatus,
    private _consecutiveFailures: number,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    userId: string;
    name: string;
    url: MonitorUrl;
    interval: CheckInterval;
    status?: MonitorStatus;
    consecutiveFailures?: number;
    createdAt?: Date;
  }): Monitor {
    const monitor = new Monitor(
      params.id,
      params.userId,
      params.name,
      params.url,
      params.interval,
      params.status ?? MonitorStatus.ACTIVE,
      params.consecutiveFailures ?? 0,
      params.createdAt ?? new Date(),
    );

    if (!params.status) {
      monitor._events.push(
        new MonitorCreated(params.id, params.userId, params.interval.minutes),
      );
    }

    return monitor;
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._events];
    this._events.length = 0;
    return events;
  }

  get status(): MonitorStatus {
    return this._status;
  }

  get consecutiveFailures(): number {
    return this._consecutiveFailures;
  }

  pause(): void {
    if (this._status === MonitorStatus.PAUSED) {
      throw new DomainError('Monitor is already paused');
    }

    this._status = MonitorStatus.PAUSED;
    this._events.push(new MonitorPaused(this.id));
  }

  resume(): void {
    if (this._status !== MonitorStatus.PAUSED) {
      throw new DomainError('Monitor is not paused');
    }

    this._status = MonitorStatus.ACTIVE;
    this._consecutiveFailures = 0;
    this._events.push(new MonitorResumed(this.id, this.interval.minutes));
  }

  recordFailure(): void {
    this._consecutiveFailures += 1;

    if (
      this._consecutiveFailures >= DEGRADED_THRESHOLD &&
      this._status !== MonitorStatus.DEGRADED
    ) {
      this._status = MonitorStatus.DEGRADED;
      this._events.push(
        new MonitorDegraded(this.id, this.userId, this.url.value),
      );
    }
  }

  recordSuccess(): void {
    const wasDown = this._status === MonitorStatus.DEGRADED;

    this._consecutiveFailures = 0;
    this._status = MonitorStatus.ACTIVE;

    if (wasDown) {
      this._events.push(
        new MonitorRecovered(this.id, this.userId, this.url.value),
      );
    }
  }

  isActive(): boolean {
    return this._status !== MonitorStatus.PAUSED;
  }
}