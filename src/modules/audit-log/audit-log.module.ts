import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, PrismaService, AuditService],
  exports: [AuditLogService]
})
export class AuditLogModule {}
