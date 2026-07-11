import { IsIn, IsInt, IsString, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMonitorDto {
  @ApiProperty({ example: 'My API' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'https://api.example.com/health' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  @ApiProperty({ example: 5, enum: [1, 5, 10, 30, 60], description: 'Interval in minutes' })
  @IsInt()
  @IsIn([1, 5, 10, 30, 60])
  intervalMinutes: number;
}
