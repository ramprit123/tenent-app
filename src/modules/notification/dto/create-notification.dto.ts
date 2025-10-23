import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
