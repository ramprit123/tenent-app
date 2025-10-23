import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRentPaymentDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
