export class CreateMonitorCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly intervalMinutes: number,
  ) {}
}