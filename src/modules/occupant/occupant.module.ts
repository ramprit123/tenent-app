import { Module } from '@nestjs/common';
import { OccupantService } from './occupant.service';
import { OccupantController } from './occupant.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [OccupantController],
  providers: [OccupantService, PrismaService, AuditService],
  exports: [OccupantService]
})
export class OccupantModule {}
