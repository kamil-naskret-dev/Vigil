import { IsString, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertChannelDto {
  @ApiProperty({ example: 'https://hooks.slack.com/services/xxx/yyy/zzz' })
  @IsUrl({ protocols: ['http', 'https'], require_tld: false })
  url: string;

  @ApiProperty({ example: 'my-super-secret-key-1234', minLength: 16 })
  @IsString()
  @MinLength(16)
  secret: string;
}
