import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAuditLogDto {
  // Add explicit fields for strong typing later
  @IsOptional()
  data?: any;
}
