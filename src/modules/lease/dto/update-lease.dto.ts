import { IsOptional } from 'class-validator';

export class UpdateLeaseDto {
  @IsOptional()
  data?: any;
}
