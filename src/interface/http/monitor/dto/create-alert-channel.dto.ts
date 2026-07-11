import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreateAlertChannelDto {
  @IsUrl({ protocols: ['http', 'https'], require_tld: false })
  url: string;

  @IsString()
  @MinLength(16)
  secret: string;
}