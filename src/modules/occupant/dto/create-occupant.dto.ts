import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOccupantDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
