export class ResumeMonitorCommand {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}