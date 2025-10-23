import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateTenantDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
