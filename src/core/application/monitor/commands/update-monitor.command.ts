export class UpdateMonitorCommand {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly intervalMinutes?: number,
  ) {}
}