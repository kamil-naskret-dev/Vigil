export class AlertChannel {
  private constructor(
    public readonly id: string,
    public readonly monitorId: string,
    public readonly url: string,
    public readonly secret: string,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    monitorId: string;
    url: string;
    secret: string;
    createdAt?: Date;
  }): AlertChannel {
    return new AlertChannel(
      params.id,
      params.monitorId,
      params.url,
      params.secret,
      params.createdAt ?? new Date(),
    );
  }
}