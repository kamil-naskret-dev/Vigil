import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMonitorDto {
  @ApiPropertyOptional({ example: 'My API v2' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 10, enum: [1, 5, 10, 30, 60] })
  @IsOptional()
  @IsInt()
  @IsIn([1, 5, 10, 30, 60])
  intervalMinutes?: number;
}
