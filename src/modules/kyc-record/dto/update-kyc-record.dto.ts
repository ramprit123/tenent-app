import { IsOptional } from 'class-validator';

export class UpdateKycRecordDto {
  @IsOptional()
  data?: any;
}
