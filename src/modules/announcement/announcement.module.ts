import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService, PrismaService, AuditService],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
