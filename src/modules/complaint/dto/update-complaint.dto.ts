import { IsOptional } from 'class-validator';

export class UpdateComplaintDto {
  @IsOptional()
  data?: any;
}
