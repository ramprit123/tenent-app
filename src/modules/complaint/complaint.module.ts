import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [ComplaintController],
  providers: [ComplaintService, PrismaService, AuditService],
  exports: [ComplaintService]
})
export class ComplaintModule {}
