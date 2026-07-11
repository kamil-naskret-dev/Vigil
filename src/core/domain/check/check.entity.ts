export class Check {
  private constructor(
    public readonly id: string,
    public readonly monitorId: string,
    public readonly statusCode: number | null,
    public readonly responseTimeMs: number | null,
    public readonly isUp: boolean,
    public readonly error: string | null,
    public readonly checkedAt: Date,
  ) {}

  static create(params: {
    id: string;
    monitorId: string;
    statusCode: number | null;
    responseTimeMs: number | null;
    isUp: boolean;
    error: string | null;
    checkedAt?: Date;
  }): Check {
    return new Check(
      params.id,
      params.monitorId,
      params.statusCode,
      params.responseTimeMs,
      params.isUp,
      params.error,
      params.checkedAt ?? new Date(),
    );
  }
}