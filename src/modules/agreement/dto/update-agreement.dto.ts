import { IsOptional } from 'class-validator';

export class UpdateAgreementDto {
  @IsOptional()
  data?: any;
}
