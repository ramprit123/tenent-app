import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  providers: [EventService],
  controllers: [EventController]
})
export class EventModule {}
