import { Module } from '@nestjs/common';
import { FlatService } from './flat.service';
import { FlatController } from './flat.controller';
import { FlatController } from './flat.controller';
import { FlatService } from './flat.service';

@Module({
  providers: [FlatService],
  controllers: [FlatController]
})
export class FlatModule {}
