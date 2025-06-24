// update-zone.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
