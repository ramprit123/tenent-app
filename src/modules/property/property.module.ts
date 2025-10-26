import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService, PrismaService, AuditService],
  exports: [PropertyService]
})
export class PropertyModule {}
