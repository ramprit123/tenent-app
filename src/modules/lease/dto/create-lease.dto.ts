import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLeaseDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
