import { Module } from '@nestjs/common';
import { FlatService } from './flat.service';
import { FlatController } from './flat.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [FlatController],
  providers: [FlatService, PrismaService, AuditService],
  exports: [FlatService]
})
export class FlatModule {}
