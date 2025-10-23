import { IsOptional } from 'class-validator';

export class UpdateFlatDto {
  @IsOptional()
  data?: any;
}
