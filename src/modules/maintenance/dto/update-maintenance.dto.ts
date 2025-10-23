import { IsOptional } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsOptional()
  data?: any;
}
