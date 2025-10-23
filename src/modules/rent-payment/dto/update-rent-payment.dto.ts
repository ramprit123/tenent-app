import { IsOptional } from 'class-validator';

export class UpdateRentPaymentDto {
  @IsOptional()
  data?: any;
}
