import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMonitorDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsInt()
  @IsIn([1, 5, 10, 30, 60])
  intervalMinutes?: number;
}