export class GetCheckHistoryQuery {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly from?: Date,
    public readonly to?: Date,
    public readonly limit: number = 100,
    public readonly page: number = 1,
  ) {}
}