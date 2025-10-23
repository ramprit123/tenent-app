import { IsOptional } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  data?: any;
}
