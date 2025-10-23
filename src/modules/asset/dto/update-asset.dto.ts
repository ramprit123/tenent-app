import { IsOptional } from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  data?: any;
}
