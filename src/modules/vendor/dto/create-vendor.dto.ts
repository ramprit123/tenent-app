import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateVendorDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
