export class DeleteAlertChannelCommand {
  constructor(
    public readonly channelId: string,
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}