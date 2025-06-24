import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateZoneDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  userId: number; 
}
