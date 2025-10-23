import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController]
})
export class NotificationModule {}
