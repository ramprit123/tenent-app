import { IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  data?: any;
}
