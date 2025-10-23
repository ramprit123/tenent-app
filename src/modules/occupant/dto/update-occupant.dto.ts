import { IsOptional } from 'class-validator';

export class UpdateOccupantDto {
  @IsOptional()
  data?: any;
}
