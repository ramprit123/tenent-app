import { Module } from '@nestjs/common';
import { KycRecordService } from './kyc-record.service';
import { KycRecordController } from './kyc-record.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [KycRecordController],
  providers: [KycRecordService, PrismaService, AuditService],
  exports: [KycRecordService]
})
export class KycRecordModule {}
