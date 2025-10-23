import { IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  data?: any;
}
