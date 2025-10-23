import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAssetDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
