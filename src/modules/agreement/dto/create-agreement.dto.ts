import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAgreementDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
