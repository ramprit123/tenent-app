import { IsOptional } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  data?: any;
}
