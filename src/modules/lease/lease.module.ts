import { Module } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { LeaseController } from './lease.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [LeaseController],
  providers: [LeaseService, PrismaService, AuditService],
  exports: [LeaseService]
})
export class LeaseModule {}
