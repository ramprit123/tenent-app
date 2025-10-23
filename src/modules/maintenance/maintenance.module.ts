import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, PrismaService, AuditService],
  exports: [MaintenanceService]
})
export class MaintenanceModule {}
