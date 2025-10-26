import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, PrismaService, AuditService],
  exports: [TenantService]
})
export class TenantModule {}
