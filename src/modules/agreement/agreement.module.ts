import { Module } from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { AgreementController } from './agreement.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [AgreementController],
  providers: [AgreementService, PrismaService, AuditService],
  exports: [AgreementService]
})
export class AgreementModule {}
