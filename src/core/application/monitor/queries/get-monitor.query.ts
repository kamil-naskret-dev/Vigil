export class GetMonitorQuery {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}