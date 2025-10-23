import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [EventController],
  providers: [EventService, PrismaService, AuditService],
  exports: [EventService]
})
export class EventModule {}
