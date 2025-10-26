import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, AuditService],
  exports: [NotificationService]
})
export class NotificationModule {}
