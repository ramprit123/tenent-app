import { IsOptional } from 'class-validator';

export class UpdateAuditLogDto {
  @IsOptional()
  data?: any;
}
