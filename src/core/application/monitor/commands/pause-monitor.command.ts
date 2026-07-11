export class PauseMonitorCommand {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}