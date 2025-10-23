import { IsOptional } from 'class-validator';

export class UpdateAnnouncementDto {
  @IsOptional()
  data?: any;
}
