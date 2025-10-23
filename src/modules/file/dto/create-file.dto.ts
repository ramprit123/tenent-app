import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
