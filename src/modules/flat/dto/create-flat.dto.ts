import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateFlatDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
