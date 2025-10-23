import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
