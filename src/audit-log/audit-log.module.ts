import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

@Module({
  providers: [AuditLogService],
  controllers: [AuditLogController]
})
export class AuditLogModule {}
