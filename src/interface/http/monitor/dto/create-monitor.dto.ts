import { IsIn, IsInt, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  @IsInt()
  @IsIn([1, 5, 10, 30, 60])
  intervalMinutes: number;
}