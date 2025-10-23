import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateComplaintDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
