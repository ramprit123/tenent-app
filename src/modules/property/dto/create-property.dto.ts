import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePropertyDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
