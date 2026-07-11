export class CreateAlertChannelCommand {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly url: string,
    public readonly secret: string,
  ) {}
}