import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMaintenanceDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
