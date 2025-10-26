import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [VendorController],
  providers: [VendorService, PrismaService, AuditService],
  exports: [VendorService]
})
export class VendorModule {}
