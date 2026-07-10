import { DomainEvent } from '../events/domain-event.base';

export class MonitorCreated extends DomainEvent {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly intervalMinutes: number,
  ) {
    super();
  }
}

export class MonitorPaused extends DomainEvent {
  constructor(public readonly monitorId: string) {
    super();
  }
}

export class MonitorResumed extends DomainEvent {
  constructor(
    public readonly monitorId: string,
    public readonly intervalMinutes: number,
  ) {
    super();
  }
}

export class MonitorDegraded extends DomainEvent {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly url: string,
  ) {
    super();
  }
}

export class MonitorRecovered extends DomainEvent {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly url: string,
  ) {
    super();
  }
}