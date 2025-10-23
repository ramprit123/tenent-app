import { IsOptional } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  data?: any;
}
