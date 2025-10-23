import { Module } from '@nestjs/common';
import { SocietyService } from './society.service';
import { SocietyController } from './society.controller';
import { SocietyController } from './society.controller';
import { SocietyService } from './society.service';

@Module({
  providers: [SocietyService],
  controllers: [SocietyController]
})
export class SocietyModule {}
