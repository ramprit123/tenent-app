import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAnnouncementDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
