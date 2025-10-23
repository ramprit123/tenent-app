import { IsOptional } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  data?: any;
}
