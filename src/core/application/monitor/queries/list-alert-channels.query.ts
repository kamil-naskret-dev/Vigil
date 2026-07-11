export class ListAlertChannelsQuery {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
  ) {}
}