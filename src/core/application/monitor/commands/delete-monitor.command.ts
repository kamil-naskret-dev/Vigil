export class DeleteMonitorCommand {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}